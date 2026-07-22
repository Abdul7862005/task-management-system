const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export const getMonthMatrix = (year, month) => {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startWeekday = firstDay.getDay();
  const totalDays = lastDay.getDate();

  const cells = [];

  for (let i = 0; i < startWeekday; i++) {
    cells.push(null);
  }

  for (let d = 1; d <= totalDays; d++) {
    cells.push(new Date(year, month, d));
  }

  while (cells.length % 7 !== 0) {
    cells.push(null);
  }

  const weeks = [];
  for (let i = 0; i < cells.length; i += 7) {
    weeks.push(cells.slice(i, i + 7));
  }

  return weeks;
};

const toDateKey = (date) => date.toISOString().split('T')[0];

export const getOccurrencesForMonth = (tasks, year, month) => {
  const map = {};
  const monthStart = new Date(year, month, 1);
  const monthEnd = new Date(year, month + 1, 0);

  const addOccurrence = (date, task) => {
    if (date.getFullYear() !== year || date.getMonth() !== month) return;
    const key = toDateKey(date);
    if (!map[key]) map[key] = [];
    map[key].push(task);
  };

  tasks.forEach((task) => {
    if (task.planType === 'Monthly') {
      addOccurrence(new Date(task.dueDate), task);
      return;
    }

    if (task.planType === 'Daily') {
      const start = new Date(task.createdAt);
      start.setHours(0, 0, 0, 0);
      const cursor = new Date(Math.max(start, monthStart));
      while (cursor <= monthEnd) {
        addOccurrence(new Date(cursor), task);
        cursor.setDate(cursor.getDate() + 1);
      }
      return;
    }

    if (task.planType === 'Weekly') {
      if (task.recurrence === 'Once') {
        addOccurrence(new Date(task.dueDate), task);
        return;
      }

      if (!task.dayOfWeek) return;

      const targetDayIndex = DAY_NAMES.indexOf(task.dayOfWeek);
      const created = new Date(task.createdAt);
      created.setHours(0, 0, 0, 0);

      const cursor = new Date(monthStart);
      while (cursor.getDay() !== targetDayIndex) {
        cursor.setDate(cursor.getDate() + 1);
      }

      while (cursor <= monthEnd) {
        if (cursor >= created) {
          if (task.recurrence === 'Biweekly') {
            const diffDays = Math.round((cursor - created) / 86400000);
            const diffWeeks = Math.floor(diffDays / 7);
            if (diffWeeks % 2 === 0) {
              addOccurrence(new Date(cursor), task);
            }
          } else {
            addOccurrence(new Date(cursor), task);
          }
        }
        cursor.setDate(cursor.getDate() + 7);
      }
    }
  });

  return map;
};