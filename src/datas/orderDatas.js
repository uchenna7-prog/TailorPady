export const ORDER_STATUS_LABELS = {
  pending:     'Pending',
  in_progress: 'In Progress',
  completed:   'Completed',
  delivered:   'Delivered',
  cancelled:   'Cancelled',
}

export const ORDER_STATUS_STYLES = {
  pending: {
    background:  'rgba(234,179,8,0.12)',
    color:       '#a16207',
    borderColor: 'rgba(234,179,8,0.3)',
  },
  in_progress: {
    background:  'rgba(59,130,246,0.12)',
    color:       '#2563eb',
    borderColor: 'rgba(59,130,246,0.3)',
  },
  completed: {
    background:  'rgba(34,197,94,0.12)',
    color:       '#15803d',
    borderColor: 'rgba(34,197,94,0.3)',
  },
  delivered: {
    background:  'rgba(129,140,248,0.12)',
    color:       '#4f46e5',
    borderColor: 'rgba(129,140,248,0.3)',
  },
  cancelled: {
    background:  'rgba(239,68,68,0.12)',
    color:       '#dc2626',
    borderColor: 'rgba(239,68,68,0.3)',
  },
}

export const ORDER_STAGES = [
  { value: 'measurement_taken', label: 'Measurement Taken', icon: 'straighten'    },
  { value: 'fabric_ready',      label: 'Fabric Ready',      icon: 'layers'        },
  { value: 'cutting',           label: 'Cutting',           icon: 'content_cut'   },
  { value: 'sewing',            label: 'Sewing',            icon: 'send'          },
  { value: 'embroidery',        label: 'Embroidery',        icon: 'auto_awesome'  },
  { value: 'weaving',           label: 'Weaving',           icon: 'texture'       },
  { value: 'fitting',           label: 'Fitting',           icon: 'accessibility' },
  { value: 'adjustments',       label: 'Adjustments',       icon: 'tune'          },
  { value: 'finishing',         label: 'Finishing',         icon: 'dry_cleaning'  },
  { value: 'quality_check',     label: 'Quality Check',     icon: 'fact_check'    },
  { value: 'ready',             label: 'Ready',             icon: 'check_circle'  },
]

export const PRIORITY_BANNER_CONFIG = {
  normal: { label: 'Normal Priority', className: 'priorityBanner_normal' },
  urgent: { label: 'Urgent ★',        className: 'priorityBanner_urgent' },
  vip:    { label: 'VIP ★',           className: 'priorityBanner_vip'    },
}

export const ORDER_STAGE_AUTO_STATUS = {
  measurement_taken: 'pending',
  fabric_ready:      'pending',
  cutting:           'in_progress',
  weaving:           'in_progress',
  sewing:            'in_progress',
  embroidery:        'in_progress',
  fitting:           'in_progress',
  adjustments:       'in_progress',
  finishing:         'in_progress',
  quality_check:     'in_progress',
  ready:             'completed',
}

export const ORDER_STATUS_CORRESPONDING_STAGES = {
  pending:     ['measurement_taken', 'fabric_ready'],
  in_progress: ['cutting', 'weaving', 'sewing', 'embroidery', 'fitting', 'adjustments', 'finishing', 'quality_check'],
  completed:   'ready',
  delivered:   'ready',
}
