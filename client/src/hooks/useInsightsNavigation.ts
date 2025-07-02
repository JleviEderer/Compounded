
export const useInsightsNavigation = (weekAnchor: Date, quarterAnchor: Date, setWeekAnchor: (date: Date) => void, setQuarterAnchor: (date: Date) => void) => {
  const isCurrentWeek = () => {
    const now = new Date();
    const currentWeekStart = new Date(now);
    currentWeekStart.setDate(now.getDate() - now.getDay());

    const weekAnchorStart = new Date(weekAnchor);
    weekAnchorStart.setDate(weekAnchor.getDate() - weekAnchor.getDay());

    return currentWeekStart.toDateString() === weekAnchorStart.toDateString();
  };

  const isCurrentQuarter = () => {
    const now = new Date();
    const currentQuarter = Math.floor(now.getMonth() / 3);
    const anchorQuarter = Math.floor(quarterAnchor.getMonth() / 3);

    return now.getFullYear() === quarterAnchor.getFullYear() && currentQuarter === anchorQuarter;
  };

  const navigateWeek = (direction: 'prev' | 'next') => {
    const newAnchor = new Date(weekAnchor);
    newAnchor.setDate(weekAnchor.getDate() + (direction === 'next' ? 7 : -7));
    setWeekAnchor(newAnchor);
  };

  const navigateQuarter = (direction: 'prev' | 'next') => {
    const newAnchor = new Date(quarterAnchor);
    const monthsToAdd = direction === 'next' ? 3 : -3;
    newAnchor.setMonth(quarterAnchor.getMonth() + monthsToAdd);
    setQuarterAnchor(newAnchor);
  };

  const getWeekLabel = () => {
    const startOfWeek = new Date(weekAnchor);
    startOfWeek.setDate(weekAnchor.getDate() - weekAnchor.getDay());
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);

    return `${startOfWeek.toLocaleDateString('en', { month: 'short', day: 'numeric' })} - ${endOfWeek.toLocaleDateString('en', { month: 'short', day: 'numeric', year: 'numeric' })}`;
  };

  const getQuarterLabel = () => {
    const quarter = Math.floor(quarterAnchor.getMonth() / 3) + 1;
    return `Q${quarter} ${quarterAnchor.getFullYear()}`;
  };

  return {
    isCurrentWeek,
    isCurrentQuarter,
    navigateWeek,
    navigateQuarter,
    getWeekLabel,
    getQuarterLabel
  };
};
