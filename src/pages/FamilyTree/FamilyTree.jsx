import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Navbar from '../../components/Navbar';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import './FamilyTree.css';

// --- Mock family tree data stored in localStorage ---
const TREE_KEY = 'tomorrow-family-tree';

function getTree() {
  try {
    return JSON.parse(localStorage.getItem(TREE_KEY) || 'null');
  } catch {
    return null;
  }
}

function saveTree(tree) {
  localStorage.setItem(TREE_KEY, JSON.stringify(tree));
}

function getSubscription() {
  try {
    return JSON.parse(localStorage.getItem('tomorrow-subscription') || '{"plan":"free"}');
  } catch {
    return { plan: 'free' };
  }
}

const GENERATIONS = ['Great-Grandparent', 'Grandparent', 'Parent', 'You', 'Child', 'Grandchild', 'Great-Grandchild'];
const RELATIONSHIPS = {
  child: 'Child',
  partner: 'Partner',
  sibling: 'Sibling',
  parent: 'Parent',
  grandparent: 'Grandparent',
  grandchild: 'Grandchild',
  greatgrandparent: 'Great-Grandparent',
  greatgrandchild: 'Great-Grandchild',
};

function generateId() {
  return Math.random().toString(36).slice(2, 10);
}

// --- Tree node component ---
function TreeNode({ node, onSelect, selectedId, onAddChild, onEdit, onDelete }) {
  const isSelected = selectedId === node.id;
  const hasChildren = node.children && node.children.length > 0;

  return (
    <div className={`tree-node ${isSelected ? 'tree-node-selected' : ''}`}>
      <div
        className="tree-node-card"
        onClick={() => onSelect(node)}
      >
        <div className="tree-node-avatar">
          {node.name?.[0]?.toUpperCase() || '?'}
        </div>
        <div className="tree-node-info">
          <p className="tree-node-name">{node.name || 'Unnamed'}</p>
          <p className="tree-node-relation">{node.relationship || 'Family member'}</p>
          {node.born && <p className="tree-node-born">b. {node.born}</p>}
          {node.lettersCount > 0 && (
            <p className="tree-node-letters">{node.lettersCount} letter{node.lettersCount !== 1 ? 's' : ''}</p>
          )}
        </div>
        <div className="tree-node-actions">
          <button className="tree-node-btn" onClick={e => { e.stopPropagation(); onEdit(node); }} title="Edit">
            ✎
          </button>
          <button className="tree-node-btn tree-node-btn-danger" onClick={e => { e.stopPropagation(); onDelete(node.id); }} title="Remove">
            ×
          </button>
        </div>
      </div>

      {hasChildren && (
        <div className="tree-children">
          {node.children.map(child => (
            <TreeNode
              key={child.id}
              node={child}
              onSelect={onSelect}
              selectedId={selectedId}
              onAddChild={onAddChild}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// --- Add/Edit Member Modal ---
function MemberModal({ onClose, onSave, editing }) {
  const [name, setName] = useState(editing?.name || '');
  const [relationship, setRelationship] = useState(editing?.relationship || 'Child');
  const [born, setBorn] = useState(editing?.born || '');
  const [generation, setGeneration] = useState(editing?.generation || 'Child');

  function handleSubmit(e) {
    e.preventDefault();
    if (!name.trim()) return;
    onSave({ name: name.trim(), relationship, born, generation, id: editing?.id || generateId() });
    onClose();
  }

  return (
    <div className="modal-backdrop" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <h3 className="modal-title">{editing ? 'Edit Family Member' : 'Add Family Member'}</h3>
        <form onSubmit={handleSubmit} className="modal-form">
          <Input
            label="Name"
            placeholder="Sofia, Grandma Rosa, Marco…"
            value={name}
            onChange={e => setName(e.target.value)}
            required
          />
          <div className="field">
            <label className="field-label">Relationship to you</label>
            <div className="relationship-picker">
              {Object.values(RELATIONSHIPS).map(rel => (
                <button
                  key={rel}
                  type="button"
                  className={`relationship-chip ${relationship === rel ? 'relationship-chip-active' : ''}`}
                  onClick={() => setRelationship(rel)}
                >
                  {rel}
                </button>
              ))}
            </div>
          </div>
          <div className="field">
            <label className="field-label">Generation</label>
            <div className="relationship-picker">
              {GENERATIONS.map(gen => (
                <button
                  key={gen}
                  type="button"
                  className={`relationship-chip ${generation === gen ? 'relationship-chip-active' : ''}`}
                  onClick={() => setGeneration(gen)}
                >
                  {gen}
                </button>
              ))}
            </div>
          </div>
          <Input
            label="Year of birth (optional)"
            type="number"
            placeholder="2005"
            value={born}
            onChange={e => setBorn(e.target.value)}
          />
          <div className="modal-actions">
            <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
            <Button type="submit" variant="primary">{editing ? 'Save Changes' : 'Add Member'}</Button>
          </div>
        </form>
      </div>
    </div>
  );
}

// --- Tree Visualizer ---
function TreeVisualizer({ tree }) {
  if (!tree) return null;

  function renderNode(node, level = 0) {
    const isRoot = level === 0;
    return (
      <div key={node.id} className="viz-node-wrapper">
        <div className={`viz-node ${isRoot ? 'viz-node-root' : ''}`}>
          <div className="viz-node-avatar">
            {node.name?.[0]?.toUpperCase() || '?'}
          </div>
          <p className="viz-node-name">{node.name}</p>
          <p className="viz-node-rel">{node.relationship}</p>
        </div>
        {node.children && node.children.length > 0 && (
          <div className="viz-children">
            {node.children.map(child => renderNode(child, level + 1))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="tree-visualizer">
      {renderNode(tree)}
    </div>
  );
}

export default function FamilyTree() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [tree, setTree] = useState(getTree);
  const [selectedNode, setSelectedNode] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingNode, setEditingNode] = useState(null);
  const [subscription] = useState(getSubscription);

  useEffect(() => {
    if (!user) {
      navigate('/auth');
    }
  }, [user, navigate]);

  if (subscription.plan !== 'legacy') {
    return (
      <div className="app-page page-enter">
        <Navbar />
        <main className="app-main">
          <div className="app-container">
            <div className="legacy-gate">
              <div className="legacy-gate-icon">✦</div>
              <h2 className="legacy-gate-title">Family Tree — Legacy Only</h2>
              <p className="legacy-gate-body">
                Build your family tree, link letters to generations, and write letters
                that pass down through time — from grandparents to grandchildren.
              </p>
              <p className="legacy-gate-body">
                Upgrade to Legacy to unlock this feature.
              </p>
              <Link to="/pricing">
                <Button variant="primary">✦ See Legacy Plan</Button>
              </Link>
            </div>
          </div>
        </main>
      </div>
    );
  }

  function handleSelectNode(node) {
    setSelectedNode(node.id === selectedNode ? null : node.id);
  }

  function handleAddChild(parentId) {
    setEditingNode(null);
    setSelectedNode(parentId);
    setShowModal(true);
  }

  function handleEdit(node) {
    setEditingNode(node);
    setShowModal(true);
  }

  function handleDelete(nodeId) {
    if (!window.confirm('Remove this family member from the tree?')) return;

    function removeNode(tree, id) {
      if (!tree) return null;
      if (tree.id === id) return null;
      return {
        ...tree,
        children: (tree.children || []).map(c => removeNode(c, id)).filter(Boolean),
      };
    }

    const updated = removeNode(tree, nodeId);
    setTree(updated);
    saveTree(updated);
    if (selectedNode === nodeId) setSelectedNode(null);
  }

  function handleSaveMember(data) {
    if (editingNode) {
      // Update existing
      function updateNode(tree, id, updates) {
        if (!tree) return null;
        if (tree.id === id) return { ...tree, ...updates };
        return {
          ...tree,
          children: (tree.children || []).map(c => updateNode(c, id, updates)),
        };
      }
      const updated = updateNode(tree, data.id, data);
      setTree(updated);
      saveTree(updated);
    } else if (selectedNode) {
      // Add child to selected node
      function addChildToNode(tree, id, child) {
        if (!tree) return null;
        if (tree.id === id) {
          return {
            ...tree,
            children: [...(tree.children || []), { ...child, children: [] }],
          };
        }
        return {
          ...tree,
          children: (tree.children || []).map(c => addChildToNode(c, id, child)),
        };
      }
      const updated = addChildToNode(tree, selectedNode, data);
      setTree(updated);
      saveTree(updated);
    } else {
      // Create root (first member)
      const newTree = { ...data, children: [] };
      setTree(newTree);
      saveTree(newTree);
    }
    setEditingNode(null);
  }

  function handleInitTree() {
    setShowModal(true);
    setEditingNode(null);
  }

  function findSelectedNode(node, id) {
    if (!node) return null;
    if (node.id === id) return node;
    for (const child of node.children || []) {
      const found = findSelectedNode(child, id);
      if (found) return found;
    }
    return null;
  }

  const selectedData = selectedNode ? findSelectedNode(tree, selectedNode) : null;

  return (
    <div className="app-page page-enter">
      <Navbar />

      <main className="app-main">
        <div className="app-container">
          <header className="app-header">
            <div className="app-header-left">
              <h1 className="app-title">Family Tree</h1>
              <p className="app-subtitle">
                {tree
                  ? 'Your legacy, mapped across generations.'
                  : 'Build your family tree and link letters to the people who matter most.'}
              </p>
            </div>
            {tree && (
              <Button variant="primary" onClick={() => { setEditingNode(null); setShowModal(true); }}>
                + Add Member
              </Button>
            )}
          </header>

          {!tree ? (
            <div className="tree-empty stagger-in">
              <Card className="tree-empty-card">
                <div className="tree-empty-icon">🌳</div>
                <h2 className="tree-empty-title">Start your family tree</h2>
                <p className="tree-empty-body">
                  Add the first person — it could be you, a parent, a child, or anyone
                  who'll be part of your legacy letter network.
                </p>
                <Button variant="primary" onClick={handleInitTree}>
                  ✦ Add First Member
                </Button>
              </Card>
            </div>
          ) : (
            <div className="tree-layout stagger-in">
              {/* Tree list */}
              <div className="tree-list-panel">
                <div className="tree-list-header">
                  <h2 className="tree-list-title">Your Tree</h2>
                  <button
                    className="tree-add-child-btn"
                    onClick={() => {
                      if (selectedNode) handleAddChild(selectedNode);
                      else { setEditingNode(null); setShowModal(true); }
                    }}
                  >
                    + Add
                  </button>
                </div>
                <TreeNode
                  node={tree}
                  onSelect={handleSelectNode}
                  selectedId={selectedNode}
                  onAddChild={handleAddChild}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              </div>

              {/* Detail panel */}
              <div className="tree-detail-panel">
                {selectedData ? (
                  <Card className="tree-detail-card">
                    <div className="tree-detail-header">
                      <div className="tree-detail-avatar">
                        {selectedData.name?.[0]?.toUpperCase() || '?'}
                      </div>
                      <div>
                        <h3 className="tree-detail-name">{selectedData.name}</h3>
                        <p className="tree-detail-rel">{selectedData.relationship} · {selectedData.generation}</p>
                        {selectedData.born && <p className="tree-detail-born">Born {selectedData.born}</p>}
                      </div>
                    </div>

                    <div className="tree-detail-actions">
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => {
                          setEditingNode(selectedData);
                          setShowModal(true);
                        }}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleAddChild(selectedData.id)}
                      >
                        + Add Child
                      </Button>
                      <Link to={`/write?to=${encodeURIComponent(selectedData.name)}&relation=${encodeURIComponent(selectedData.relationship)}`}>
                        <Button variant="secondary" size="sm">
                          ✦ Write Letter
                        </Button>
                      </Link>
                    </div>

                    <div className="tree-detail-info">
                      <p className="tree-detail-info-label">Letter history</p>
                      {selectedData.lettersCount > 0 ? (
                        <p className="tree-detail-info-value">
                          {selectedData.lettersCount} letter{selectedData.lettersCount !== 1 ? 's' : ''} written to {selectedData.name}
                        </p>
                      ) : (
                        <p className="tree-detail-info-empty">No letters linked yet.</p>
                      )}
                    </div>

                    {selectedData.children && selectedData.children.length > 0 && (
                      <div className="tree-detail-children">
                        <p className="tree-detail-info-label">Children in tree</p>
                        <div className="tree-children-chips">
                          {selectedData.children.map(c => (
                            <button
                              key={c.id}
                              className={`tree-child-chip ${selectedNode === c.id ? 'tree-child-chip-active' : ''}`}
                              onClick={() => handleSelectNode(c)}
                            >
                              {c.name}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </Card>
                ) : (
                  <Card className="tree-detail-card tree-detail-empty">
                    <div className="tree-empty-icon">👆</div>
                    <p className="tree-detail-empty-text">Select someone in your tree to see details and write them a letter.</p>
                  </Card>
                )}
              </div>
            </div>
          )}
        </div>
      </main>

      {showModal && (
        <MemberModal
          editing={editingNode}
          onClose={() => { setShowModal(false); setEditingNode(null); }}
          onSave={handleSaveMember}
        />
      )}
    </div>
  );
}
