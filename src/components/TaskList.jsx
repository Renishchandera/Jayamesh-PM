import React, { useEffect, useState } from "react";
import { db } from "../db";

export default function TaskList({ projectId }) {
  const [tasks, setTasks] = useState([]);
  const [text, setText] = useState('');

  useEffect(()=>{ load(); }, [projectId]);

  async function load(){
    const t = await db.tasks.where('projectId').equals(projectId).sortBy('priority');
    setTasks(t);
  }

  async function add(){
    if(!text.trim()) return;
    await db.tasks.add({ projectId, title: text.trim(), status:'todo', priority: 1, createdAt: Date.now(), updatedAt: Date.now() });
    setText('');
    load();
  }

  async function toggleDone(task){
    await db.tasks.update(task.id, { status: task.status === 'done' ? 'todo' : 'done', updatedAt: Date.now() });
    load();
  }

  return (
    <div>
      <div className="mb-4 flex gap-2">
        <input value={text} onChange={e=>setText(e.target.value)} placeholder="Add task" className="flex-1 p-2 rounded border"/>
        <button onClick={add} className="px-4 py-2 rounded bg-indigo-600 text-white">Add</button>
      </div>

      <ul className="space-y-2">
        {tasks.map(t => (
          <li key={t.id} className="p-3 rounded bg-white flex items-center justify-between">
            <div className="flex items-center gap-3">
              <input type="checkbox" checked={t.status==='done'} onChange={()=>toggleDone(t)} />
              <div className={t.status==='done' ? 'line-through text-slate-400' : ''}>{t.title}</div>
            </div>
            <div className="text-xs text-slate-500">{t.priority}</div>
          </li>
        ))}
      </ul>
    </div>
  );
}
