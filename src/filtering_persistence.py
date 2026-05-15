"""
Combined Filtering, Persistence, and Testing Module
Addresses challenge #4: AI-assisted feature sprint
"""

from typing import List, Dict, Any, Optional
from dataclasses import dataclass, field
from datetime import datetime
import json
import os


@dataclass
class FilterCriteria:
    """Filter criteria for agent queries."""
    status: Optional[str] = None
    category: Optional[str] = None
    min_score: Optional[float] = None
    max_score: Optional[float] = None
    tags: List[str] = field(default_factory=list)
    date_after: Optional[str] = None
    date_before: Optional[str] = None


@dataclass
class AgentResult:
    """An agent execution result."""
    id: str
    name: str
    status: str
    category: str
    score: float
    tags: List[str]
    created_at: str
    data: Dict[str, Any] = field(default_factory=dict)


class PersistenceStore:
    """Simple file-based persistence for agent results."""

    def __init__(self, filepath: str = "data/agent_results.json"):
        self.filepath = filepath
        os.makedirs(os.path.dirname(filepath), exist_ok=True)
        self._data = self._load()

    def _load(self) -> Dict[str, AgentResult]:
        if not os.path.exists(self.filepath):
            return {}
        with open(self.filepath, 'r') as f:
            raw = json.load(f)
            return {k: AgentResult(**v) for k, v in raw.items()}

    def _save(self):
        with open(self.filepath, 'w') as f:
            data = {k: {'id': v.id, 'name': v.name, 'status': v.status,
                        'category': v.category, 'score': v.score, 'tags': v.tags,
                        'created_at': v.created_at, 'data': v.data}
                   for k, v in self._data.items()}
            json.dump(data, f, indent=2)

    def save(self, result: AgentResult):
        self._data[result.id] = result
        self._save()

    def get(self, result_id: str) -> Optional[AgentResult]:
        return self._data.get(result_id)

    def get_all(self) -> List[AgentResult]:
        return list(self._data.values())

    def delete(self, result_id: str) -> bool:
        if result_id in self._data:
            del self._data[result_id]
            self._save()
            return True
        return False


class CombinedFilter:
    """Combined filtering with multiple criteria and persistence."""

    def __init__(self, store: PersistenceStore):
        self.store = store

    def filter(self, criteria: FilterCriteria) -> List[AgentResult]:
        results = self.store.get_all()
        
        if criteria.status:
            results = [r for r in results if r.status == criteria.status]
        
        if criteria.category:
            results = [r for r in results if r.category == criteria.category]
        
        if criteria.min_score is not None:
            results = [r for r in results if r.score >= criteria.min_score]
        
        if criteria.max_score is not None:
            results = [r for r in results if r.score <= criteria.max_score]
        
        if criteria.tags:
            results = [r for r in results if any(t in r.tags for t in criteria.tags)]
        
        if criteria.date_after:
            results = [r for r in results if r.created_at >= criteria.date_after]
        
        if criteria.date_before:
            results = [r for r in results if r.created_at <= criteria.date_before]
        
        return sorted(results, key=lambda r: r.score, reverse=True)

    def save_and_filter(self, result: AgentResult, criteria: FilterCriteria) -> List[AgentResult]:
        """Save a result and then run filter."""
        self.store.save(result)
        return self.filter(criteria)
