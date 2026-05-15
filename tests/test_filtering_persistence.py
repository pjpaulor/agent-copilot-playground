"""
Tests for combined filtering, persistence, and testing module.
"""

import pytest
import tempfile
import os
from filtering_persistence import (
    FilterCriteria, AgentResult, PersistenceStore, CombinedFilter
)


@pytest.fixture
def temp_store():
    with tempfile.NamedTemporaryFile(suffix='.json', delete=False) as f:
        filepath = f.name
    store = PersistenceStore(filepath)
    yield store
    os.unlink(filepath)


@pytest.fixture
def sample_results(temp_store):
    results = [
        AgentResult(id="1", name="agent-a", status="completed", category="nlp",
                    score=0.95, tags=["production", "fast"], created_at="2024-01-15"),
        AgentResult(id="2", name="agent-b", status="running", category="vision",
                    score=0.80, tags=["experimental"], created_at="2024-02-20"),
        AgentResult(id="3", name="agent-c", status="completed", category="nlp",
                    score=0.60, tags=["beta"], created_at="2024-03-10"),
        AgentResult(id="4", name="agent-d", status="failed", category="audio",
                    score=0.30, tags=["production"], created_at="2024-01-05"),
    ]
    for r in results:
        temp_store.save(r)
    return temp_store


def test_save_and_retrieve(temp_store):
    result = AgentResult(id="test", name="test-agent", status="completed",
                         category="test", score=0.5, tags=[], created_at="2024-01-01")
    temp_store.save(result)
    retrieved = temp_store.get("test")
    assert retrieved is not None
    assert retrieved.name == "test-agent"


def test_filter_by_status(sample_results):
    cf = CombinedFilter(sample_results)
    results = cf.filter(FilterCriteria(status="completed"))
    assert len(results) == 2
    assert all(r.status == "completed" for r in results)


def test_filter_by_category(sample_results):
    cf = CombinedFilter(sample_results)
    results = cf.filter(FilterCriteria(category="nlp"))
    assert len(results) == 2


def test_filter_by_score_range(sample_results):
    cf = CombinedFilter(sample_results)
    results = cf.filter(FilterCriteria(min_score=0.7, max_score=0.9))
    assert len(results) == 1
    assert results[0].name == "agent-b"


def test_filter_by_tags(sample_results):
    cf = CombinedFilter(sample_results)
    results = cf.filter(FilterCriteria(tags=["production"]))
    assert len(results) == 2


def test_filter_by_date_range(sample_results):
    cf = CombinedFilter(sample_results)
    results = cf.filter(FilterCriteria(date_after="2024-02-01"))
    assert len(results) == 2


def test_combined_filters(sample_results):
    cf = CombinedFilter(sample_results)
    results = cf.filter(FilterCriteria(status="completed", min_score=0.7))
    assert len(results) == 1
    assert results[0].name == "agent-a"


def test_persistence_across_instances(sample_results):
    filepath = sample_results.filepath
    new_store = PersistenceStore(filepath)
    assert len(new_store.get_all()) == 4


def test_delete(temp_store):
    result = AgentResult(id="del", name="delete-me", status="completed",
                         category="test", score=0.5, tags=[], created_at="2024-01-01")
    temp_store.save(result)
    assert temp_store.delete("del") is True
    assert temp_store.get("del") is None
    assert temp_store.delete("nonexistent") is False
