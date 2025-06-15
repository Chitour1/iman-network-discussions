
-- Create function to get category statistics
CREATE OR REPLACE FUNCTION public.get_categories_with_stats()
RETURNS TABLE (
  id uuid,
  name text,
  slug text,
  description text,
  color text,
  icon text,
  topic_count bigint,
  comment_count bigint,
  view_count bigint,
  recent_topics_count bigint
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    c.id,
    c.name,
    c.slug,
    c.description,
    c.color,
    c.icon,
    COALESCE(t.topic_count, 0) as topic_count,
    COALESCE(co.comment_count, 0) as comment_count,
    COALESCE(t.view_count, 0) as view_count,
    COALESCE(rt.recent_topics_count, 0) as recent_topics_count
  FROM
    public.categories c
  LEFT JOIN (
    SELECT
      category_id,
      COUNT(id)::bigint as topic_count,
      SUM(view_count)::bigint as view_count
    FROM
      public.topics
    GROUP BY
      category_id
  ) t ON c.id = t.category_id
  LEFT JOIN (
    SELECT
      t.category_id,
      COUNT(co.id)::bigint as comment_count
    FROM
      public.comments co
    JOIN
      public.topics t ON co.topic_id = t.id
    GROUP BY
      t.category_id
  ) co ON c.id = co.category_id
  LEFT JOIN (
    SELECT
      category_id,
      COUNT(id)::bigint as recent_topics_count
    FROM
      public.topics
    WHERE
      created_at >= now() - interval '24 hours'
    GROUP BY
      category_id
  ) rt ON c.id = rt.category_id
  WHERE c.is_active = true
  ORDER BY c.sort_order;
END;
$$ LANGUAGE plpgsql;
