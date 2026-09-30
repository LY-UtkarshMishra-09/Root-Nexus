'use client';

import { useLocalStorage } from './useLocalStorage';
import { TodoTask, TaskPriority, TaskCategory } from '@/types';
import { INITIAL_TODOS } from '@/lib/mockData';
import { useCallback } from 'react';

const STORAGE_KEY = 'rootnexus_todos_v1';

export function useTodos() {
  const [tasks, setTasks, isHydrated] = useLocalStorage<TodoTask[]>(STORAGE_KEY, INITIAL_TODOS);

  const addTask = useCallback(
    (newTask: {
      title: string;
      subjectCode: string;
      subjectName: string;
      dueDate: string;
      priority: TaskPriority;
      category: TaskCategory;
    }) => {
      const task: TodoTask = {
        id: `task-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        title: newTask.title.trim(),
        subjectCode: newTask.subjectCode.trim(),
        subjectName: newTask.subjectName.trim() || newTask.subjectCode.trim(),
        dueDate: newTask.dueDate,
        priority: newTask.priority,
        category: newTask.category,
        completed: false,
        createdAt: new Date().toISOString().split('T')[0],
      };

      setTasks((prev) => [task, ...prev]);
      return task;
    },
    [setTasks]
  );

  const toggleTask = useCallback(
    (taskId: string) => {
      setTasks((prev) =>
        prev.map((t) => (t.id === taskId ? { ...t, completed: !t.completed } : t))
      );
    },
    [setTasks]
  );

  const deleteTask = useCallback(
    (taskId: string) => {
      setTasks((prev) => prev.filter((t) => t.id !== taskId));
    },
    [setTasks]
  );

  const resetToSeeds = useCallback(() => {
    setTasks(INITIAL_TODOS);
  }, [setTasks]);

  const pendingTasks = tasks.filter((t) => !t.completed);
  const completedTasks = tasks.filter((t) => t.completed);

  return {
    tasks,
    pendingTasks,
    completedTasks,
    isHydrated,
    addTask,
    toggleTask,
    deleteTask,
    resetToSeeds,
  };
}
