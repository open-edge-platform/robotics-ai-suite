import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Pin } from "lucide-react";
import { skillsQueryOptions, type SkillSource } from "../../../data/skills";
import { CheckboxItem } from "../../CheckboxItem";
import { SearchBox } from "../../SearchBox";
import { SkillCard } from "./SkillCard";
import { pluralize } from "@site/src/utils/pluralize";
import styles from "./styles.module.css";

const SOURCE_LABELS: Record<SkillSource, string> = {
  toolkit: "Robotics AI Suite",
  intel: "Intel Skills",
};

export default function SkillCatalog() {
  const { data: skills = [] } = useQuery(skillsQueryOptions());

  const [query, setQuery] = useState("");
  const [selectedSources, setSelectedSources] = useState<SkillSource[]>([]);
  const [selectedHw, setSelectedHw] = useState<string[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [showAllProducts, setShowAllProducts] = useState(false);

  // Compute source facets from skills
  const sourceOptions = useMemo(() => {
    const counts: Record<SkillSource, number> = { toolkit: 0, intel: 0 };
    skills.forEach((skill) => {
      const src: SkillSource = skill.source === "toolkit" ? "toolkit" : "intel";
      counts[src] += 1;
    });

    return (["toolkit", "intel"] as SkillSource[])
      .filter((value) => counts[value] > 0)
      .map((value) => ({
        value,
        label: SOURCE_LABELS[value],
        count: counts[value],
      }));
  }, [skills]);

  // Compute hardware facets from skills
  const hwOptions = useMemo(() => {
    const counts: Record<string, number> = {};
    skills.forEach((skill) => {
      if (skill.hwClass) {
        counts[skill.hwClass] = (counts[skill.hwClass] || 0) + 1;
      }
    });

    return Object.entries(counts)
      .map(([value, count]) => ({
        value,
        label: value.toUpperCase(),
        count,
      }))
      .sort((a, b) => b.count - a.count);
  }, [skills]);

  // Compute product facets from skills
  const productOptions = useMemo(() => {
    const counts: Record<string, number> = {};
    skills.forEach((skill) => {
      skill.products?.forEach((product) => {
        counts[product] = (counts[product] || 0) + 1;
      });
    });

    return Object.entries(counts)
      .map(([value, count]) => ({
        value,
        label: value,
        count,
      }))
      .sort((a, b) => b.count - a.count);
  }, [skills]);

  const displayedProductOptions = useMemo(() => {
    if (showAllProducts || productOptions.length <= 8) {
      return productOptions;
    }
    return productOptions.slice(0, 8);
  }, [productOptions, showAllProducts]);

  const shown = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return skills.filter((skill) => {
      if (selectedSources.length > 0) {
        const src: SkillSource = skill.source === "toolkit" ? "toolkit" : "intel";
        if (!selectedSources.includes(src)) {
          return false;
        }
      }

      if (selectedHw.length > 0) {
        if (!skill.hwClass || !selectedHw.includes(skill.hwClass)) {
          return false;
        }
      }

      if (selectedProducts.length > 0) {
        const hasProduct = skill.products?.some((p) =>
          selectedProducts.includes(p)
        );
        if (!hasProduct) {
          return false;
        }
      }

      if (!normalizedQuery) {
        return true;
      }

      const sourceLabel =
        skill.source === "toolkit" ? "robotics ai suite toolkit" : "intel";
      const haystack =
        `${skill.name} ${skill.summary} ${skill.description} ${sourceLabel} ${skill.hwClass || ""} ${(skill.products || []).join(" ")} ${(skill.labels || []).join(" ")}`.toLowerCase();
      return haystack.includes(normalizedQuery);
    });
  }, [skills, query, selectedSources, selectedHw, selectedProducts]);

  const pinnedShown = useMemo(
    () => shown.filter((skill) => skill.pinned),
    [shown]
  );
  const unpinnedShown = useMemo(
    () => shown.filter((skill) => !skill.pinned),
    [shown]
  );

  const toggleSource = (src: SkillSource) => {
    setSelectedSources((prev) =>
      prev.includes(src) ? prev.filter((v) => v !== src) : [...prev, src]
    );
  };

  const toggleHw = (hw: string) => {
    setSelectedHw((prev) =>
      prev.includes(hw) ? prev.filter((v) => v !== hw) : [...prev, hw]
    );
  };

  const toggleProduct = (prod: string) => {
    setSelectedProducts((prev) =>
      prev.includes(prod) ? prev.filter((v) => v !== prod) : [...prev, prod]
    );
  };

  const hasActiveFilters =
    selectedSources.length > 0 ||
    selectedHw.length > 0 ||
    selectedProducts.length > 0 ||
    query.trim() !== "";

  const clearAll = () => {
    setSelectedSources([]);
    setSelectedHw([]);
    setSelectedProducts([]);
    setQuery("");
  };

  const showSeparatePinnedSection =
    pinnedShown.length > 0 && unpinnedShown.length > 0;

  return (
    <section className="container margin-vert--xl">
      <div className={styles.layout}>
        <aside className={styles.panel} aria-label="Skill filters">
          <div className={styles.filterHeader}>
            <span className={styles.filterLabel}>Filter by</span>
            {hasActiveFilters && (
              <button onClick={clearAll} className={styles.clearAll}>
                Clear All
              </button>
            )}
          </div>

          <SearchBox
            placeholder="Search skills"
            value={query}
            onChange={({ target }) => setQuery(target.value)}
          />

          {sourceOptions.length > 1 && (
            <div className={styles.filterSection}>
              <h4 className={styles.sectionTitle}>Source</h4>
              <div className={styles.filterList}>
                {sourceOptions.map((src) => (
                  <CheckboxItem
                    key={src.value}
                    label={src.label}
                    count={src.count}
                    checked={selectedSources.includes(src.value)}
                    onChange={() => toggleSource(src.value)}
                  />
                ))}
              </div>
            </div>
          )}

          {hwOptions.length > 0 && (
            <div className={styles.filterSection}>
              <h4 className={styles.sectionTitle}>Hardware</h4>
              <div className={styles.filterList}>
                {hwOptions.map((hw) => (
                  <CheckboxItem
                    key={hw.value}
                    label={hw.label}
                    count={hw.count}
                    checked={selectedHw.includes(hw.value)}
                    onChange={() => toggleHw(hw.value)}
                  />
                ))}
              </div>
            </div>
          )}

          {productOptions.length > 0 && (
            <div className={styles.filterSection}>
              <h4 className={styles.sectionTitle}>Products</h4>
              <div className={styles.filterList}>
                {displayedProductOptions.map((prod) => (
                  <CheckboxItem
                    key={prod.value}
                    label={prod.label}
                    count={prod.count}
                    checked={selectedProducts.includes(prod.value)}
                    onChange={() => toggleProduct(prod.value)}
                  />
                ))}
              </div>
              {productOptions.length > 8 && (
                <button
                  type="button"
                  className={styles.showMoreBtn}
                  onClick={() => setShowAllProducts(!showAllProducts)}
                >
                  {showAllProducts
                    ? "Show less"
                    : `+${productOptions.length - 8} more`}
                </button>
              )}
            </div>
          )}
        </aside>

        <div className={styles.resultsColumn}>
          <p className={styles.count}>
            <span>{shown.length}</span> {pluralize(shown.length, "Skill")} found
          </p>

          {showSeparatePinnedSection ? (
            <>
              <div className={styles.groupSection}>
                <h2 className={styles.groupHeading}>
                  <Pin size={15} aria-hidden="true" />
                  Pinned Skills
                </h2>
                <div className={styles.grid}>
                  {pinnedShown.map((skill) => (
                    <SkillCard key={skill.id} skill={skill} />
                  ))}
                </div>
              </div>

              <div className={styles.groupSection}>
                <h2 className={styles.groupHeading}>
                  {hasActiveFilters ? "Matching Skills" : "All Skills"}
                </h2>
                <div className={styles.grid}>
                  {unpinnedShown.map((skill) => (
                    <SkillCard key={skill.id} skill={skill} />
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div className={styles.grid}>
              {shown.map((skill) => (
                <SkillCard key={skill.id} skill={skill} />
              ))}
            </div>
          )}

          {shown.length === 0 ? (
            <p className={styles.emptyState}>
              No skills match the current search and filter selection.
            </p>
          ) : null}
        </div>
      </div>
    </section>
  );
}
