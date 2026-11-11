import { useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { Timer } from 'lucide-react'
import { SERVICES, type ServiceId } from '../lib/data'
import { FeatureLine, Tabs } from './ui'

/** "Services" component from Figma: segmented tabs + price card (Default / Variant2-4). */
export function ServicePreview({ titleSize = 18, priceSize = 36 }: { titleSize?: number; priceSize?: number }) {
  const [tab, setTab] = useState<ServiceId>('express')
  const s = SERVICES.find((x) => x.id === tab)!
  return (
    <div className="flex w-full flex-col gap-2">
      <Tabs id="services" value={tab} onChange={setTab} items={SERVICES.map((x) => ({ value: x.id, label: x.tab }))} />
      <div className="overflow-hidden rounded-lg border border-line bg-white">
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.div
            key={tab}
            initial={{ opacity: 0, filter: 'blur(2px)' }}
            animate={{ opacity: 1, filter: 'blur(0px)' }}
            exit={{ opacity: 0, filter: 'blur(2px)' }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            className="flex flex-col py-2"
          >
            <div className="flex items-start justify-between gap-2.5 px-4 pt-2 pb-1">
              <div className="flex flex-col gap-2.5 pt-1">
                <p className="font-bold leading-none" style={{ fontSize: titleSize }}>{s.title}</p>
                <p className="flex items-center gap-1 text-sm leading-none">
                  <Timer size={16} strokeWidth={2} />
                  {s.duration}
                </p>
              </div>
              <p className="flex items-end gap-1 leading-none">
                {s.price === null ? (
                  <span className="pt-2 text-lg font-bold">Price varies</span>
                ) : (
                  <>
                    <span className="pb-0.5 text-sm opacity-50">QAR</span>
                    <span className="tabular font-bold tracking-[-0.03em]" style={{ fontSize: priceSize, lineHeight: 0.8 }}>{s.price}</span>
                  </>
                )}
              </p>
            </div>
            <div className="flex flex-col gap-1 p-4">
              {s.features.map((f) => <FeatureLine key={f}>{f}</FeatureLine>)}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}
