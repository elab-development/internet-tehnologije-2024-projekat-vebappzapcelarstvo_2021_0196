CREATE VIEW v_CommentsByBeekeeper AS
SELECT
  u.id AS beekeeper_id,
  u.username,
  COUNT(tc.id) AS comments_count
FROM TaskComments tc
JOIN Users u ON u.id = tc.author_id
WHERE u.role = 'Pcelar'
GROUP BY u.id, u.username;