import { ICON_BG,ICON_META } from "../../datas"
import { formatTitle } from "../../utils"
import { MIcon } from "../MIcon/MIcon"
import { TagPill } from "../TagPill/TagPill"
import styles from "./SheetHero.module.css"


export function SheetHero({ item, customerName }) {
    
  const meta   = ICON_META[item.type] || ICON_META.brief
  const iconBg = ICON_BG[item.type]   || 'var(--surface2)'

  return (
    <div className={styles.sheetHero}>
      <div className={styles.sheetHeroIcon} style={{ background: iconBg }}>
        <MIcon name={meta.icon} size="1.4rem" color={meta.color} />
      </div>
      <div className={styles.sheetHeroBody}>
        <TagPill label={item.tag} />
        <p className={styles.sheetHeroTitle}>{formatTitle(item.title)}</p>
        {customerName && (
          <div className={styles.sheetHeroMeta}>
            <MIcon name="person" size="0.7rem" color="var(--text3)" />
            <span>{customerName}</span>
          </div>
        )}
      </div>
    </div>
  )
}
