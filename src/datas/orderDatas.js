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
  { value: 'measurement_taken', label: 'Measurement Taken',   icon: 'straighten'    },
  { value: 'design_selected',   label: 'Design Selected',     icon: 'design_services' },
  { value: 'fabric_ready',      label: 'Fabric Sourced',      icon: 'layers'        },
  { value: 'pattern_drafted',   label: 'Pattern Drafted',     icon: 'edit_note'     },
  { value: 'cutting',           label: 'Fabric Cutting',      icon: 'content_cut'   },
  { value: 'embroidery',        label: 'Embroidery & Embellishment', icon: 'auto_awesome' },
  { value: 'sewing',            label: 'Sewing',              icon: 'checkroom'     },
  { value: 'fitting',           label: 'First Fitting',       icon: 'accessibility' },
  { value: 'adjustments',       label: 'Alterations',         icon: 'tune'          },
  { value: 'final_fitting',     label: 'Final Fitting',       icon: 'accessibility_new' },
  { value: 'finishing',         label: 'Finishing Touches',   icon: 'dry_cleaning'  },
  { value: 'quality_check',     label: 'Quality Check',       icon: 'fact_check'    },
  { value: 'packaging',         label: 'Pressing & Packaging', icon: 'inventory_2' },
  { value: 'ready',             label: 'Ready for Pickup',    icon: 'check_circle'  },
  { value: 'delivered',         label: 'Delivered',           icon: 'local_shipping' },
]

export const PRIORITY_BANNER_CONFIG = {
  normal: { label: 'Normal Priority', className: 'priorityBanner_normal' },
  urgent: { label: 'Urgent ★',        className: 'priorityBanner_urgent' },
  vip:    { label: 'VIP ★',           className: 'priorityBanner_vip'    },
}

export const ORDER_STAGE_AUTO_STATUS = {
  measurement_taken: 'pending',
  design_selected:   'pending',
  fabric_ready:       'pending',
  pattern_drafted:    'in_progress',
  cutting:            'in_progress',
  sewing:             'in_progress',
  embroidery:         'in_progress',
  fitting:            'in_progress',
  adjustments:        'in_progress',
  final_fitting:      'in_progress',
  finishing:          'in_progress',
  quality_check:      'in_progress',
  packaging:          'in_progress',
  ready:              'completed',
  delivered:          'delivered',
}

export const ORDER_STATUS_CORRESPONDING_STAGES = {
  pending:     ['measurement_taken', 'design_selected', 'fabric_ready'],
  in_progress: ['pattern_drafted', 'cutting', 'sewing', 'embroidery', 'fitting', 'adjustments', 'final_fitting', 'finishing', 'quality_check', 'packaging'],
  completed:   'ready',
  delivered:   'delivered',
}