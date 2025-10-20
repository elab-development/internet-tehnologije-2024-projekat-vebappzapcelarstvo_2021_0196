CREATE VIEW v_TaskCompletionByMonth AS
SELECT
  FORMAT(ISNULL(done_at, assigned_at), 'yyyy-MM') AS year_month,
  COUNT(*) AS done_count
FROM TaskAssignments
WHERE status = 'DONE'
GROUP BY FORMAT(ISNULL(done_at, assigned_at), 'yyyy-MM');