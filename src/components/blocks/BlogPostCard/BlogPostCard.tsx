import { forwardRef } from "react";
import { cn } from "../../../utils/cn";
import "./BlogPostCard.css";

export interface BlogPostCardProps
  extends Omit<React.HTMLAttributes<HTMLElement>, "title"> {
  /** Cover image slot (e.g. an <img>). */
  cover?: React.ReactNode;
  /** Category tag label. */
  category?: React.ReactNode;
  /** Post title. */
  title: React.ReactNode;
  /** Short excerpt / summary. */
  excerpt?: React.ReactNode;
  /** Author avatar slot. */
  authorAvatar?: React.ReactNode;
  /** Author name. */
  authorName?: React.ReactNode;
  /** Publish date, e.g. "Jun 21, 2026". */
  date?: React.ReactNode;
  /** Estimated read time, e.g. "5 min read". */
  readTime?: React.ReactNode;
  /** Href for the post. When set, the title becomes a link. */
  href?: string;
  /** Click handler for the title link. */
  onTitleClick?: React.MouseEventHandler<HTMLAnchorElement>;
}

/**
 * BlogPostCard — cover image, category tag, title, excerpt and an author /
 * date / read-time footer. Lifts on hover.
 */
export const BlogPostCard = forwardRef<HTMLElement, BlogPostCardProps>(
  function BlogPostCard(
    {
      cover,
      category,
      title,
      excerpt,
      authorAvatar,
      authorName,
      date,
      readTime,
      href,
      onTitleClick,
      className,
      ...rest
    },
    ref,
  ) {
    return (
      <article
        ref={ref}
        className={cn("nova-blog-post-card", className)}
        {...rest}
      >
        {cover && (
          <div className="nova-blog-post-card__cover">{cover}</div>
        )}

        <div className="nova-blog-post-card__body">
          {category && (
            <span className="nova-blog-post-card__category">{category}</span>
          )}

          <h3 className="nova-blog-post-card__title">
            {href ? (
              <a
                className="nova-blog-post-card__title-link"
                href={href}
                onClick={onTitleClick}
              >
                {title}
              </a>
            ) : (
              title
            )}
          </h3>

          {excerpt && (
            <p className="nova-blog-post-card__excerpt">{excerpt}</p>
          )}

          {(authorName || authorAvatar || date || readTime) && (
            <div className="nova-blog-post-card__meta">
              {(authorAvatar || authorName) && (
                <div className="nova-blog-post-card__author">
                  {authorAvatar && (
                    <span
                      className="nova-blog-post-card__author-avatar"
                      aria-hidden="true"
                    >
                      {authorAvatar}
                    </span>
                  )}
                  {authorName && (
                    <span className="nova-blog-post-card__author-name">
                      {authorName}
                    </span>
                  )}
                </div>
              )}
              {(date || readTime) && (
                <div className="nova-blog-post-card__meta-detail">
                  {date && <span>{date}</span>}
                  {date && readTime && (
                    <span
                      className="nova-blog-post-card__dot"
                      aria-hidden="true"
                    >
                      ·
                    </span>
                  )}
                  {readTime && <span>{readTime}</span>}
                </div>
              )}
            </div>
          )}
        </div>
      </article>
    );
  },
);
