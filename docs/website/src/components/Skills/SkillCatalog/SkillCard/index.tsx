import clsx from "clsx";
import { Pin } from "lucide-react";
import CopyIcon from "../../../../../static/img/icon/copy.svg";
import type { Skill } from "../../../../data/skills";
import { useCopyToClipboard } from "../../../../hooks/useCopyToClipboard.hook";
import styles from "./styles.module.css";

export const SkillCard = ({ skill }: { skill: Skill }) => {
  const installCommand =
    skill.installCommand || `npx skills add intel/skills --skill ${skill.id}`;
  const { copied, copy } = useCopyToClipboard();
  const isToolkit = skill.source === "toolkit";

  return (
    <div
      className={clsx(
        styles.item,
        isToolkit && styles.toolkitItem,
        skill.pinned && styles.pinnedItem,
      )}
    >
      <div className={styles.header}>
        <h3 className={styles.name}>
          {skill.sourceUrl ? (
            <a
              href={skill.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.nameLink}
              title={`View source for ${skill.name} on GitHub`}
            >
              {skill.name}
            </a>
          ) : (
            skill.name
          )}
        </h3>

        {(isToolkit || skill.pinned) && (
          <div className={styles.metaBadges}>
            {isToolkit && (
              <span className={styles.toolkitBadge}>Robotics AI Suite</span>
            )}
            {skill.pinned && (
              <span className={styles.pinnedBadge}>
                <Pin size={12} aria-hidden="true" />
                {skill.pinnedBadge || "Pinned"}
              </span>
            )}
          </div>
        )}
      </div>

      <p className={styles.description}>{skill.summary || skill.description}</p>

      <div className={styles.footer}>
        <div className={styles.tags}>
          {skill.labels.map((label) => (
            <span key={label} className={styles.badge}>
              {label}
            </span>
          ))}
        </div>

        <button
          type="button"
          className={styles.copyButton}
          onClick={() => copy(installCommand)}
          title={`Copy install command: ${installCommand}`}
        >
          {copied ? (
            "✓ Copied"
          ) : (
            <>
              <CopyIcon /> Use Skill
            </>
          )}
        </button>
      </div>
    </div>
  );
};
