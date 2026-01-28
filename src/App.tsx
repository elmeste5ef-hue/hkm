import React, { useEffect, useMemo, useState } from 'react';
import {
  AlertCircle,
  CheckCircle2,
  Copy,
  Cross,
  Download,
  FileSpreadsheet,
  FileText,
  GripVertical,
  Layout,
  Loader2,
  MessageSquare,
  Palette,
  Pencil,
  Plus,
  Save,
  Search,
  Shield,
  Sparkles,
  Swords,
  Trash2,
  Upload,
  X,
  Zap
} from 'lucide-react';

// --- Types & Constants ---

type Role =
  | 'Tank'
  | 'Healer'
  | 'Melee DPS'
  | 'Ranged DPS'
  | 'Tank/Healer'
  | 'Tank/Melee DPS'
  | 'Healer/Ranged DPS'
  | 'Healer/Melee DPS'
  | 'Tank/Healer/Melee DPS'
  | 'Tank/Healer/Ranged DPS';

type Status = 'Main' | 'Trial' | 'Backup';
type ClassName =
  | 'Death Knight' | 'Demon Hunter' | 'Druid' | 'Evoker' | 'Hunter'
  | 'Mage' | 'Monk' | 'Paladin' | 'Priest' | 'Rogue'
  | 'Shaman' | 'Warlock' | 'Warrior';

interface Player {
  id: string;
  name: string;
  class: ClassName;
  role: Role;
  status: Status;
  note?: string;
  altName?: string;
  altClass?: ClassName;
  altRole?: Role;
  alt2Name?: string;
  alt2Class?: ClassName;
  alt2Role?: Role;
}

// --- Theme Configuration ---
type Theme = {
  id: string;
  label: string;
  bgApp: string;
  bgHeader: string;
  bgCard: string;
  borderColor: string;
  accentColor: string;
  accentHover: string;
  textMain: string;
  textMuted: string;
  activeClass: string;
};

const THEMES: Record<string, Theme> = {
  midnight: {
    id: 'midnight',
    label: 'Midnight',
    bgApp: '#111317',
    bgHeader: '#161920',
    bgCard: '#1e2128',
    borderColor: '#2b2f38',
    accentColor: '#4f46e5',
    accentHover: '#4338ca',
    textMain: '#e2e8f0',
    textMuted: '#64748b',
    activeClass: 'bg-indigo-500'
  },
  alliance: {
    id: 'alliance',
    label: 'Alliance',
    bgApp: '#0b101a',
    bgHeader: '#111827',
    bgCard: '#1f2937',
    borderColor: '#374151',
    accentColor: '#2563eb',
    accentHover: '#1d4ed8',
    textMain: '#f1f5f9',
    textMuted: '#94a3b8',
    activeClass: 'bg-blue-500'
  },
  horde: {
    id: 'horde',
    label: 'Horde',
    bgApp: '#1a0b0b',
    bgHeader: '#2a1212',
    bgCard: '#3f1818',
    borderColor: '#5c2222',
    accentColor: '#dc2626',
    accentHover: '#b91c1c',
    textMain: '#fce7f3',
    textMuted: '#be123c',
    activeClass: 'bg-red-500'
  },
  fel: {
    id: 'fel',
    label: 'Fel',
    bgApp: '#051205',
    bgHeader: '#0a1f0d',
    bgCard: '#112914',
    borderColor: '#1e4023',
    accentColor: '#16a34a',
    accentHover: '#15803d',
    textMain: '#dcfce7',
    textMuted: '#4ade80',
    activeClass: 'bg-green-500'
  }
};

const ROLES: Role[] = [
  'Tank',
  'Healer',
  'Melee DPS',
  'Ranged DPS',
  'Tank/Melee DPS',
  'Healer/Ranged DPS',
  'Healer/Melee DPS',
  'Tank/Healer'
];

const CLASSES: ClassName[] = [
  'Death Knight', 'Demon Hunter', 'Druid', 'Evoker', 'Hunter',
  'Mage', 'Monk', 'Paladin', 'Priest', 'Rogue',
  'Shaman', 'Warlock', 'Warrior'
];

const CLASS_COLORS: Record<ClassName, string> = {
  'Death Knight': '#C41E3A',
  'Demon Hunter': '#A330C9',
  'Druid': '#FF7C0A',
  'Evoker': '#33937F',
  'Hunter': '#AAD372',
  'Mage': '#3FC7EB',
  'Monk': '#00FF98',
  'Paladin': '#F48CBA',
  'Priest': '#FFFFFF',
  'Rogue': '#FFF468',
  'Shaman': '#0070DE',
  'Warlock': '#8788EE',
  'Warrior': '#C69B6D'
};

const BUFF_RULES: Record<string, { label: string; classes: ClassName[]; type: 'buff' | 'utility' }> = {
  lust: { label: 'Bloodlust', classes: ['Shaman', 'Mage', 'Evoker', 'Hunter'], type: 'buff' },
  intellect: { label: 'Intellect', classes: ['Mage'], type: 'buff' },
  stamina: { label: 'Stamina', classes: ['Priest'], type: 'buff' },
  ap: { label: 'Battle Shout', classes: ['Warrior'], type: 'buff' },
  mark: { label: 'Mark of the Wild', classes: ['Druid'], type: 'buff' },
  phys: { label: 'Mystic Touch', classes: ['Monk'], type: 'buff' },
  magic: { label: 'Chaos Brand', classes: ['Demon Hunter'], type: 'buff' },
  dev: { label: 'Devotion Aura', classes: ['Paladin'], type: 'buff' },
  brez: { label: 'Combat Rez', classes: ['Druid', 'Death Knight', 'Warlock', 'Paladin'], type: 'utility' },
  rally: { label: 'Rallying Cry', classes: ['Warrior'], type: 'utility' },
  amz: { label: 'Anti-Magic Zone', classes: ['Death Knight'], type: 'utility' },
  darkness: { label: 'Darkness', classes: ['Demon Hunter'], type: 'utility' },
  gate: { label: 'Gateway', classes: ['Warlock'], type: 'utility' },
  innervate: { label: 'Innervate', classes: ['Druid'], type: 'utility' }
};

const INITIAL_ROSTER: Player[] = [
  { id: '1', name: 'Tyzone', class: 'Paladin', role: 'Tank', status: 'Main', note: 'RL', altName: 'Azizam', altClass: 'Death Knight', altRole: 'Tank' },
  { id: '2', name: 'Muff', class: 'Monk', role: 'Tank', status: 'Main', note: '', altName: 'Prep', altClass: 'Demon Hunter', altRole: 'Tank' },
  { id: '3', name: 'Silent', class: 'Priest', role: 'Healer', status: 'Main', note: 'PI Target', altName: 'RNG?', altClass: 'Druid', altRole: 'Healer' },
  { id: '4', name: 'Bust', class: 'Monk', role: 'Healer', status: 'Main', altName: 'RNG?', altClass: 'Hunter', altRole: 'Ranged DPS' },
  { id: '5', name: 'Zarook', class: 'Monk', role: 'Healer', status: 'Main', altName: 'Zarookalt', altClass: 'Mage', altRole: 'Ranged DPS' },
  { id: '6', name: 'Connor', class: 'Paladin', role: 'Healer', status: 'Main', altName: 'Azizam', altClass: 'Monk', altRole: 'Healer' },
  { id: '7', name: 'Jyser', class: 'Monk', role: 'Healer', status: 'Main', altName: 'Jyseralt', altClass: 'Paladin', altRole: 'Tank' },
  { id: '8', name: 'Ravie', class: 'Death Knight', role: 'Melee DPS', status: 'Main', altName: 'Ravpriest', altClass: 'Priest', altRole: 'Healer' },
  { id: '9', name: 'Typhus', class: 'Death Knight', role: 'Melee DPS', status: 'Main', note: 'Grips', altName: 'Tyrogue', altClass: 'Rogue', altRole: 'Melee DPS' },
  { id: '10', name: 'Johhnysham', class: 'Shaman', role: 'Ranged DPS', status: 'Main', altName: 'John', altClass: 'Shaman', altRole: 'Melee DPS' },
  { id: '11', name: 'Rahtae', class: 'Warrior', role: 'Melee DPS', status: 'Main', note: 'Shout duty', altName: 'Rahrogue', altClass: 'Rogue', altRole: 'Melee DPS' },
  { id: '12', name: 'Swingshot', class: 'Demon Hunter', role: 'Melee DPS', status: 'Main', altName: 'Swing', altClass: 'Shaman', altRole: 'Ranged DPS' },
  { id: '13', name: 'Ayaryn', class: 'Warlock', role: 'Ranged DPS', status: 'Main', altName: 'Aya', altClass: 'Warlock', altRole: 'Ranged DPS' },
  { id: '14', name: 'Zulregul', class: 'Warlock', role: 'Ranged DPS', status: 'Main', note: 'Gate', altName: 'Zul', altClass: 'Mage', altRole: 'Ranged DPS' },
  { id: '15', name: 'Elathir', class: 'Mage', role: 'Ranged DPS', status: 'Main', altName: 'Ela', altClass: 'Evoker', altRole: 'Healer' },
  { id: '16', name: 'Kekr', class: 'Evoker', role: 'Ranged DPS', status: 'Main', altName: 'Kek', altClass: 'Mage', altRole: 'Ranged DPS' },
  { id: '17', name: 'Korpikz', class: 'Hunter', role: 'Ranged DPS', status: 'Main', altName: '-', altClass: undefined, altRole: undefined },
  { id: '18', name: 'LFM', class: 'Druid', role: 'Ranged DPS', status: 'Main', altName: '-', altClass: undefined, altRole: undefined },
  { id: '19', name: 'Matsuura', class: 'Demon Hunter', role: 'Tank/Melee DPS', status: 'Trial', altName: 'Mat', altClass: 'Death Knight', altRole: 'Tank' },
  { id: '20', name: 'Puck', class: 'Shaman', role: 'Melee DPS', status: 'Trial', altName: '-', altClass: undefined, altRole: undefined },
  { id: '21', name: 'Shado', class: 'Warrior', role: 'Melee DPS', status: 'Trial', altName: '-', altClass: undefined, altRole: undefined },
  { id: '22', name: 'Pomino', class: 'Priest', role: 'Healer', status: 'Backup', altName: '-', altClass: undefined, altRole: undefined },
  { id: '23', name: 'Jelky', class: 'Demon Hunter', role: 'Melee DPS', status: 'Backup', altName: '-', altClass: undefined, altRole: undefined },
  { id: '24', name: 'Phoenix', class: 'Mage', role: 'Ranged DPS', status: 'Backup', altName: '-', altClass: undefined, altRole: undefined },
  { id: '25', name: 'Direct', class: 'Monk', role: 'Tank/Healer', status: 'Backup', altName: '-', altClass: undefined, altRole: undefined }
];

const RoleIcon = ({
  role,
  className = 'w-4 h-4',
  color,
  style
}: {
  role?: Role;
  className?: string;
  color?: string;
  style?: React.CSSProperties;
}) => {
  if (!role) return <div className="w-4 h-4" />;
  const iconStyle = { color, ...style };
  const props = { className, style: iconStyle };

  const isTank = role.includes('Tank');
  const isHealer = role.includes('Healer');
  const isMelee = role.includes('Melee');
  const isRanged = role.includes('Ranged');

  if (role === 'Tank') return <Shield {...props} />;
  if (role === 'Healer') return <Cross {...props} />;
  if (role === 'Melee DPS') return <Swords {...props} />;
  if (role === 'Ranged DPS') return <Zap {...props} />;

  return (
    <div className="flex items-center -space-x-1" title={role}>
      {isTank && <Shield className={`${className} scale-90`} style={iconStyle} />}
      {isHealer && <Cross className={`${className} scale-90`} style={iconStyle} />}
      {isMelee && <Swords className={`${className} scale-90`} style={iconStyle} />}
      {isRanged && <Zap className={`${className} scale-90`} style={iconStyle} />}
    </div>
  );
};

export default function App() {
  const [roster, setRoster] = useState<Player[]>(INITIAL_ROSTER);
  const [draggedPlayer, setDraggedPlayer] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [sidebarWidth, setSidebarWidth] = useState(320);
  const [isResizing, setIsResizing] = useState(false);

  const [currentTheme, setCurrentTheme] = useState<Theme>(THEMES.midnight);
  const [appTitle, setAppTitle] = useState('HKM War Room');
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [isThemeMenuOpen, setIsThemeMenuOpen] = useState(false);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editForm, setEditForm] = useState<Partial<Player>>({});
  const [newPlayerForm, setNewPlayerForm] = useState<Partial<Player>>({
    name: '', class: 'Warrior', role: 'Melee DPS', status: 'Backup'
  });

  const [isAIModalOpen, setIsAIModalOpen] = useState(false);
  const [aiResponse, setAiResponse] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeAITab, setActiveAITab] = useState<'analysis' | 'recruit' | 'strategy'>('analysis');

  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importText, setImportText] = useState('');

  const mains = useMemo(() => roster.filter(p => p.status === 'Main'), [roster]);
  const trials = useMemo(() => roster.filter(p => p.status === 'Trial'), [roster]);
  const backups = useMemo(() => roster.filter(p => p.status === 'Backup'), [roster]);
  const activeRoster = [...mains, ...trials];

  const buffStatus = useMemo(() => {
    const present = new Set<string>();
    activeRoster.forEach(p => {
      Object.entries(BUFF_RULES).forEach(([key, rule]) => {
        if (rule.classes.includes(p.class)) present.add(key);
      });
    });
    return {
      present,
      missing: Object.keys(BUFF_RULES).filter(k => !present.has(k))
    };
  }, [activeRoster]);

  const classCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    activeRoster.forEach(p => {
      counts[p.class] = (counts[p.class] || 0) + 1;
    });
    return Object.keys(CLASS_COLORS).sort().map(c => ({
      name: c as ClassName,
      count: counts[c as ClassName] || 0
    }));
  }, [activeRoster]);

  const roleCounts = useMemo(() => {
    const counts = { Tank: 0, Healer: 0, Melee: 0, Ranged: 0 };
    activeRoster.forEach(p => {
      if (p.role.startsWith('Tank')) counts.Tank += 1;
      else if (p.role.startsWith('Healer')) counts.Healer += 1;
      else if (p.role.includes('Melee')) counts.Melee += 1;
      else if (p.role.includes('Ranged')) counts.Ranged += 1;
    });
    return counts;
  }, [activeRoster]);

  const callGemini = async (prompt: string) => {
    setIsGenerating(true);
    setAiResponse('');
    const apiKey = '';
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }]
          })
        }
      );
      const data = await response.json();
      if (data.error) throw new Error(data.error.message);
      setAiResponse(data.candidates[0].content.parts[0].text);
    } catch (error) {
      console.error(error);
      setAiResponse('Communications jammed! The AI War Council is unreachable right now.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAIAction = (action: 'analysis' | 'recruit' | 'strategy') => {
    setActiveAITab(action);
    const rosterSummary = activeRoster.map(p => `${p.name} (${p.class} ${p.role})`).join(', ');
    const missingBuffs = buffStatus.missing.map(k => BUFF_RULES[k].label).join(', ');

    let prompt = '';
    const systemContext = 'You are an expert World of Warcraft Raid Leader and strategist helping a Guild Master manage their Mythic roster. Be concise, tactical, and helpful.';

    if (action === 'analysis') {
      prompt = `${systemContext}
      Analyze this roster of ${activeRoster.length} players: ${rosterSummary}.
      Missing Raid Buffs: ${missingBuffs}.

      Provide a breakdown of:
      1. Composition Strengths
      2. Critical Weaknesses/Gaps
      3. Specific Utility recommendations based on available classes (e.g., if we have many DKs, mention Grips).
      `;
    } else if (action === 'recruit') {
      prompt = `${systemContext}
      We have ${activeRoster.length}/20 players.
      Current Roster: ${rosterSummary}.
      Missing Buffs: ${missingBuffs}.

      Write a recruitment message for Discord or Trade Chat.
      - Highlight what we are looking for (classes that bring missing buffs or fill role gaps).
      - If roster is full (20+), focus on "exceptional players".
      - Tone: Competitive but welcoming.
      - Use emojis appropriate for WoW.
      `;
    } else if (action === 'strategy') {
      prompt = `${systemContext}
      Based on this roster: ${rosterSummary}.

      Suggest high-level tactical assignments for a generic raid boss encounter:
      - Who handles external defensives (Ironbark, Sac, etc.)?
      - Who handles raid mobility (Roar, Windrush)?
      - Who handles crowd control/adds?
      - Suggest a cooldown rotation group.
      `;
    }

    callGemini(prompt);
  };

  const handleExportCSV = () => {
    const headers = ['Name', 'Class', 'Role', 'Status', 'Note', 'Alt1 Name', 'Alt1 Class', 'Alt1 Role', 'Alt2 Name', 'Alt2 Class', 'Alt2 Role'];

    const rows = roster.map(p => [
      p.name,
      p.class,
      p.role,
      p.status,
      p.note || '',
      p.altName || '',
      p.altClass || '',
      p.altRole || '',
      p.alt2Name || '',
      p.alt2Class || '',
      p.alt2Role || ''
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', 'hkm_roster_export.csv');
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleImport = () => {
    if (!importText.trim()) return;

    const firstLine = importText.split('\n')[0];
    const separator = firstLine.includes('\t') ? '\t' : ',';

    try {
      const lines = importText.split('\n').filter(l => l.trim());
      const startIndex = lines[0].toLowerCase().startsWith('name') || lines[0].toLowerCase().startsWith('"name"') ? 1 : 0;

      const newPlayers: Player[] = [];

      for (let i = startIndex; i < lines.length; i += 1) {
        let cells: string[] = [];

        if (separator === ',') {
          lines[i].match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g);
          cells = lines[i].split(',').map(c => c.replace(/^"|"$/g, '').trim());
        } else {
          cells = lines[i].split('\t').map(c => c.trim());
        }

        if (cells.length >= 4) {
          const player: Player = {
            id: Math.random().toString(36).substr(2, 9),
            name: cells[0] || 'Unknown',
            class: (cells[1] as ClassName) || 'Warrior',
            role: (cells[2] as Role) || 'Melee DPS',
            status: (cells[3] as Status) || 'Backup',
            note: cells[4] || '',
            altName: cells[5] || '',
            altClass: (cells[6] as ClassName) || undefined,
            altRole: (cells[7] as Role) || undefined,
            alt2Name: cells[8] || '',
            alt2Class: (cells[9] as ClassName) || undefined,
            alt2Role: (cells[10] as Role) || undefined
          };
          newPlayers.push(player);
        }
      }

      if (confirm(`Found ${newPlayers.length} players. This will REPLACE your current roster. Continue?`)) {
        setRoster(newPlayers);
        setIsImportModalOpen(false);
        setImportText('');
      }
    } catch (error) {
      alert('Error parsing CSV. Ensure format matches the Export format.');
    }
  };

  const startResizing = (event: React.MouseEvent) => {
    event.preventDefault();
    setIsResizing(true);
  };

  useEffect(() => {
    const stopResizing = () => setIsResizing(false);
    const resize = (event: MouseEvent) => {
      if (isResizing) {
        const newWidth = window.innerWidth - event.clientX;
        if (newWidth > 250 && newWidth < 800) {
          setSidebarWidth(newWidth);
        }
      }
    };

    if (isResizing) {
      window.addEventListener('mousemove', resize);
      window.addEventListener('mouseup', stopResizing);
    }
    return () => {
      window.removeEventListener('mousemove', resize);
      window.removeEventListener('mouseup', stopResizing);
    };
  }, [isResizing]);

  const handleDragStart = (event: React.DragEvent, id: string) => {
    if (editingId) {
      event.preventDefault();
      return;
    }
    event.dataTransfer.setData('text/plain', id);
    setDraggedPlayer(id);
    event.dataTransfer.effectAllowed = 'move';
  };
  const handleDragOver = (event: React.DragEvent) => event.preventDefault();
  const handleDrop = (event: React.DragEvent, targetStatus: Status) => {
    event.preventDefault();
    const playerId = event.dataTransfer.getData('text/plain');
    setDraggedPlayer(null);
    setRoster(prev => prev.map(p => p.id === playerId ? { ...p, status: targetStatus } : p));
  };

  const startEditing = (player: Player) => {
    setEditingId(player.id);
    setEditForm({ ...player });
  };
  const saveEdit = () => {
    setRoster(prev => prev.map(p => p.id === editingId ? { ...p, ...editForm } as Player : p));
    setEditingId(null);
    setEditForm({});
  };
  const cancelEdit = () => {
    setEditingId(null);
    setEditForm({});
  };
  const deletePlayer = (id: string) => {
    if (confirm('Remove player?')) {
      setRoster(prev => prev.filter(p => p.id !== id));
      setEditingId(null);
    }
  };
  const addNewPlayer = () => {
    if (!newPlayerForm.name) return;
    setRoster([...roster, { ...newPlayerForm, id: Math.random().toString(36).substr(2, 9) } as Player]);
    setIsAddModalOpen(false);
    setNewPlayerForm({ name: '', class: 'Warrior', role: 'Melee DPS', status: 'Backup', note: '' });
  };

  const GRID_TEMPLATE = '30px minmax(160px, 1.5fr) minmax(100px, 0.8fr) minmax(140px, 1fr) minmax(140px, 1fr) minmax(150px, 1.5fr) 40px';

  const PlayerRow = ({ player }: { player: Player }) => {
    const isEditing = editingId === player.id;

    if (isEditing) {
      return (
        <div
          className="flex flex-col gap-2 p-3 border-b"
          style={{
            backgroundColor: `${currentTheme.accentColor}20`,
            borderColor: `${currentTheme.accentColor}50`
          }}
        >
          <div className="flex gap-2 items-center">
            <span className="text-xs uppercase font-bold w-12 text-right pr-2" style={{ color: currentTheme.textMuted }}>Main:</span>
            <input className="bg-black/20 border border-white/20 rounded px-2 py-1 text-sm w-40 text-white" value={editForm.name} onChange={event => setEditForm({ ...editForm, name: event.target.value })} placeholder="Name" />
            <select className="bg-black/20 border border-white/20 rounded px-2 py-1 text-sm text-white" value={editForm.class} onChange={event => setEditForm({ ...editForm, class: event.target.value as ClassName })}>
              {CLASSES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <select className="bg-black/20 border border-white/20 rounded px-2 py-1 text-sm text-white" value={editForm.role} onChange={event => setEditForm({ ...editForm, role: event.target.value as Role })}>
              {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>

          <div className="flex gap-2 items-center">
            <span className="text-xs uppercase font-bold w-12 text-right pr-2" style={{ color: currentTheme.textMuted }}>Note:</span>
            <input
              className="bg-black/20 border border-white/20 rounded px-2 py-1 text-sm flex-1 text-white"
              value={editForm.note || ''}
              onChange={event => setEditForm({ ...editForm, note: event.target.value })}
              placeholder="Add a note (e.g., RL, Flex Healer, etc.)"
            />
          </div>

          <div className="flex gap-2 items-center">
            <span className="text-xs uppercase font-bold w-12 text-right pr-2" style={{ color: currentTheme.textMuted }}>Alt 1:</span>
            <input className="bg-black/20 border border-white/20 rounded px-2 py-1 text-xs w-32 text-white" value={editForm.altName || ''} onChange={event => setEditForm({ ...editForm, altName: event.target.value })} placeholder="Alt Name" />
            <select className="bg-black/20 border border-white/20 rounded px-2 py-1 text-xs text-white" value={editForm.altClass || ''} onChange={event => setEditForm({ ...editForm, altClass: event.target.value as ClassName })}>
              <option value="">No Alt Class</option>
              {CLASSES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <select className="bg-black/20 border border-white/20 rounded px-2 py-1 text-xs text-white" value={editForm.altRole || ''} onChange={event => setEditForm({ ...editForm, altRole: event.target.value as Role })}>
              <option value="">No Alt Role</option>
              {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>

          <div className="flex gap-2 items-center">
            <span className="text-xs uppercase font-bold w-12 text-right pr-2" style={{ color: currentTheme.textMuted }}>Alt 2:</span>
            <input className="bg-black/20 border border-white/20 rounded px-2 py-1 text-xs w-32 text-white" value={editForm.alt2Name || ''} onChange={event => setEditForm({ ...editForm, alt2Name: event.target.value })} placeholder="Alt 2 Name" />
            <select className="bg-black/20 border border-white/20 rounded px-2 py-1 text-xs text-white" value={editForm.alt2Class || ''} onChange={event => setEditForm({ ...editForm, alt2Class: event.target.value as ClassName })}>
              <option value="">No Alt 2 Class</option>
              {CLASSES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <select className="bg-black/20 border border-white/20 rounded px-2 py-1 text-xs text-white" value={editForm.alt2Role || ''} onChange={event => setEditForm({ ...editForm, alt2Role: event.target.value as Role })}>
              <option value="">No Alt 2 Role</option>
              {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
            </select>

            <div className="flex-1"></div>

            <button onClick={() => deletePlayer(player.id)} className="p-1 hover:bg-red-900/50 text-red-400 rounded"><Trash2 className="w-4 h-4" /></button>
            <button onClick={saveEdit} className="p-1 hover:bg-green-900/50 text-green-400 rounded"><Save className="w-4 h-4" /></button>
            <button onClick={cancelEdit} className="p-1 hover:bg-white/10 text-white rounded"><X className="w-4 h-4" /></button>
          </div>
        </div>
      );
    }

    return (
      <div
        draggable={!editingId}
        onDragStart={(event) => handleDragStart(event, player.id)}
        className={`
          group grid items-center border-b transition-colors py-2 px-2 gap-2
          ${search && !player.name.toLowerCase().includes(search.toLowerCase()) ? 'opacity-20' : 'opacity-100'}
        `}
        style={{
          gridTemplateColumns: GRID_TEMPLATE,
          backgroundColor: currentTheme.bgCard,
          borderColor: currentTheme.borderColor,
          color: currentTheme.textMain
        }}
      >
        <div className="flex justify-center cursor-grab active:cursor-grabbing">
          <GripVertical className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: currentTheme.textMuted }} />
        </div>

        <div className="flex items-center gap-3 overflow-hidden">
          <RoleIcon role={player.role} className="w-4 h-4 flex-shrink-0" style={{ color: currentTheme.textMuted }} />
          <span className="font-bold text-sm truncate" style={{ color: currentTheme.textMain }}>{player.name}</span>
        </div>

        <div className="flex items-center">
          <span style={{ color: CLASS_COLORS[player.class] }} className="text-sm font-medium truncate">
            {player.class}
          </span>
        </div>

        <div className="flex items-center gap-2 overflow-hidden opacity-70 group-hover:opacity-100 transition-opacity">
          {player.altClass ? (
            <>
              <span style={{ color: CLASS_COLORS[player.altClass] }} className="text-xs font-medium truncate">
                {player.altName || 'Alt'}
              </span>
              <RoleIcon role={player.altRole} className="w-3 h-3 flex-shrink-0" style={{ color: currentTheme.textMuted }} />
            </>
          ) : (
            <span className="text-xs italic opacity-20 ml-2" style={{ color: currentTheme.textMuted }}>-</span>
          )}
        </div>

        <div className="flex items-center gap-2 overflow-hidden opacity-70 group-hover:opacity-100 transition-opacity">
          {player.alt2Class ? (
            <>
              <span style={{ color: CLASS_COLORS[player.alt2Class] }} className="text-xs font-medium truncate">
                {player.alt2Name || 'Alt'}
              </span>
              <RoleIcon role={player.alt2Role} className="w-3 h-3 flex-shrink-0" style={{ color: currentTheme.textMuted }} />
            </>
          ) : (
            <span className="text-xs italic opacity-20 ml-2" style={{ color: currentTheme.textMuted }}>-</span>
          )}
        </div>

        <div className="flex items-center overflow-hidden">
          {player.note ? (
            <span className="text-xs truncate italic px-2 py-0.5 rounded bg-black/20 max-w-full" style={{ color: currentTheme.textMuted }}>
              {player.note}
            </span>
          ) : (
            <span className="text-xs opacity-10 italic" style={{ color: currentTheme.textMuted }}>-</span>
          )}
        </div>

        <div className="flex justify-end">
          <button onClick={() => startEditing(player)} className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-white/10 rounded transition-all" style={{ color: currentTheme.textMuted }}>
            <Pencil className="w-3 h-3" />
          </button>
        </div>
      </div>
    );
  };

  const SectionHeader = ({ title, count, colorClass }: { title: string; count: number; colorClass: string }) => (
    <div
      className="grid items-center px-2 py-3 sticky top-0 z-10 gap-2 shadow-sm border-b"
      style={{
        gridTemplateColumns: GRID_TEMPLATE,
        backgroundColor: currentTheme.bgCard,
        borderColor: currentTheme.borderColor
      }}
    >
      <div></div>
      <div className="flex items-center gap-3">
        <div className={`w-1.5 h-4 rounded-full ${colorClass}`}></div>
        <h2 className="font-bold truncate" style={{ color: currentTheme.textMain }}>{title}</h2>
        <span className="px-2 py-0.5 rounded text-xs font-mono" style={{ backgroundColor: currentTheme.borderColor, color: currentTheme.textMuted }}>{count}</span>
      </div>
      <div className="text-[10px] uppercase tracking-widest font-semibold" style={{ color: currentTheme.textMuted }}>Class</div>
      <div className="text-[10px] uppercase tracking-widest font-semibold pl-2 border-l" style={{ color: currentTheme.textMuted, borderColor: `${currentTheme.borderColor}80` }}>Alt 1</div>
      <div className="text-[10px] uppercase tracking-widest font-semibold pl-2 border-l" style={{ color: currentTheme.textMuted, borderColor: `${currentTheme.borderColor}80` }}>Alt 2</div>
      <div className="text-[10px] uppercase tracking-widest font-semibold pl-2 border-l" style={{ color: currentTheme.textMuted, borderColor: `${currentTheme.borderColor}80` }}>Note</div>
      <div></div>
    </div>
  );

  return (
    <div className="flex h-screen font-sans selection:bg-indigo-500/30 overflow-hidden relative" style={{ backgroundColor: currentTheme.bgApp, color: currentTheme.textMain }}>
      {isImportModalOpen && (
        <div className="absolute inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="border rounded-xl shadow-2xl w-full max-w-2xl p-6" style={{ backgroundColor: currentTheme.bgCard, borderColor: currentTheme.borderColor }}>
            <h2 className="text-xl font-bold mb-2 flex items-center gap-2" style={{ color: currentTheme.textMain }}>
              <FileSpreadsheet className="w-5 h-5 text-green-400" /> Import from Sheets / Excel
            </h2>
            <p className="text-sm mb-4" style={{ color: currentTheme.textMuted }}>
              Paste your roster data here. Supported formats:
              <br />1. <strong>Copy-Paste directly from Google Sheets/Excel</strong> (Tab separated)
              <br />2. <strong>CSV File content</strong> (Comma separated)
              <br /><br />
              <span className="opacity-70">Expected Columns: Name, Class, Role, Status, Note, Alt1 Name, Alt1 Class, Alt1 Role...</span>
            </p>

            <textarea
              autoFocus
              value={importText}
              onChange={(event) => setImportText(event.target.value)}
              placeholder="Paste data here..."
              className="w-full h-64 p-3 rounded font-mono text-xs border focus:outline-none focus:ring-1"
              style={{ backgroundColor: currentTheme.bgApp, borderColor: currentTheme.borderColor, color: currentTheme.textMain, ringColor: currentTheme.accentColor }}
            />

            <div className="flex justify-end gap-3 mt-4">
              <button onClick={() => setIsImportModalOpen(false)} className="px-4 py-2 rounded hover:bg-white/10" style={{ color: currentTheme.textMuted }}>Cancel</button>
              <button onClick={handleImport} disabled={!importText.trim()} className="px-4 py-2 rounded font-bold text-white bg-green-600 hover:bg-green-700 disabled:opacity-50">
                Import Roster
              </button>
            </div>
          </div>
        </div>
      )}

      {isAIModalOpen && (
        <div className="absolute inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="border rounded-xl shadow-2xl w-full max-w-4xl h-[80vh] flex flex-col overflow-hidden" style={{ backgroundColor: currentTheme.bgCard, borderColor: currentTheme.borderColor }}>
            <div className="flex items-center justify-between p-4 border-b" style={{ borderColor: currentTheme.borderColor, backgroundColor: currentTheme.bgHeader }}>
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-indigo-400" />
                <h2 className="text-xl font-bold" style={{ color: currentTheme.textMain }}>War Council <span className="text-xs font-normal opacity-50 ml-2">Powered by Gemini</span></h2>
              </div>
              <button onClick={() => setIsAIModalOpen(false)} className="p-1 hover:bg-white/10 rounded"><X className="w-5 h-5" /></button>
            </div>

            <div className="flex-1 flex min-h-0">
              <div className="w-48 border-r flex flex-col gap-2 p-2" style={{ borderColor: currentTheme.borderColor }}>
                <button
                  onClick={() => handleAIAction('analysis')}
                  className={`text-left px-3 py-2 rounded text-sm font-medium flex items-center gap-2 ${activeAITab === 'analysis' ? currentTheme.activeClass + ' text-white' : 'hover:bg-white/5'}`}
                  style={{ color: activeAITab === 'analysis' ? '#fff' : currentTheme.textMuted }}
                >
                  <Shield className="w-4 h-4" /> Roster Analysis
                </button>
                <button
                  onClick={() => handleAIAction('recruit')}
                  className={`text-left px-3 py-2 rounded text-sm font-medium flex items-center gap-2 ${activeAITab === 'recruit' ? currentTheme.activeClass + ' text-white' : 'hover:bg-white/5'}`}
                  style={{ color: activeAITab === 'recruit' ? '#fff' : currentTheme.textMuted }}
                >
                  <MessageSquare className="w-4 h-4" /> Draft Recruit Post
                </button>
                <button
                  onClick={() => handleAIAction('strategy')}
                  className={`text-left px-3 py-2 rounded text-sm font-medium flex items-center gap-2 ${activeAITab === 'strategy' ? currentTheme.activeClass + ' text-white' : 'hover:bg-white/5'}`}
                  style={{ color: activeAITab === 'strategy' ? '#fff' : currentTheme.textMuted }}
                >
                  <FileText className="w-4 h-4" /> Boss Strategy
                </button>
              </div>

              <div className="flex-1 p-6 overflow-y-auto" style={{ backgroundColor: currentTheme.bgApp }}>
                {isGenerating ? (
                  <div className="flex flex-col items-center justify-center h-full gap-4 opacity-50">
                    <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
                    <p className="animate-pulse">Consulting the archives...</p>
                  </div>
                ) : (
                  aiResponse ? (
                    <div className="prose prose-invert max-w-none">
                      <div className="flex justify-end mb-4">
                        <button onClick={() => navigator.clipboard.writeText(aiResponse)} className="text-xs flex items-center gap-1 hover:text-white" style={{ color: currentTheme.textMuted }}>
                          <Copy className="w-3 h-3" /> Copy to Clipboard
                        </button>
                      </div>
                      <div className="whitespace-pre-wrap font-sans text-sm leading-relaxed" style={{ color: currentTheme.textMain }}>
                        {aiResponse}
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full gap-2 opacity-30" style={{ color: currentTheme.textMuted }}>
                      <Sparkles className="w-12 h-12" />
                      <p>Select a module to begin analysis</p>
                    </div>
                  )
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {isAddModalOpen && (
        <div className="absolute inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="border rounded-xl shadow-2xl w-full max-w-md p-6" style={{ backgroundColor: currentTheme.bgCard, borderColor: currentTheme.borderColor }}>
            <h2 className="text-xl font-bold mb-4" style={{ color: currentTheme.textMain }}>Add New Player</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-xs uppercase font-bold mb-1" style={{ color: currentTheme.textMuted }}>Name</label>
                <input autoFocus className="w-full border rounded p-2 outline-none focus:border-indigo-500"
                  style={{ backgroundColor: currentTheme.bgApp, borderColor: currentTheme.borderColor, color: currentTheme.textMain }}
                  value={newPlayerForm.name} onChange={event => setNewPlayerForm({ ...newPlayerForm, name: event.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs uppercase font-bold mb-1" style={{ color: currentTheme.textMuted }}>Class</label>
                  <select className="w-full border rounded p-2 outline-none"
                    style={{ backgroundColor: currentTheme.bgApp, borderColor: currentTheme.borderColor, color: currentTheme.textMain }}
                    value={newPlayerForm.class} onChange={event => setNewPlayerForm({ ...newPlayerForm, class: event.target.value as ClassName })}>{CLASSES.map(c => <option key={c} value={c}>{c}</option>)}</select>
                </div>
                <div>
                  <label className="block text-xs uppercase font-bold mb-1" style={{ color: currentTheme.textMuted }}>Role</label>
                  <select className="w-full border rounded p-2 outline-none"
                    style={{ backgroundColor: currentTheme.bgApp, borderColor: currentTheme.borderColor, color: currentTheme.textMain }}
                    value={newPlayerForm.role} onChange={event => setNewPlayerForm({ ...newPlayerForm, role: event.target.value as Role })}>{ROLES.map(r => <option key={r} value={r}>{r}</option>)}</select>
                </div>
              </div>
              <div>
                <label className="block text-xs uppercase font-bold mb-1" style={{ color: currentTheme.textMuted }}>Initial Status</label>
                <div className="flex p-1 rounded border" style={{ backgroundColor: currentTheme.bgApp, borderColor: currentTheme.borderColor }}>
                  {(['Main', 'Trial', 'Backup'] as Status[]).map(s => (
                    <button key={s} onClick={() => setNewPlayerForm({ ...newPlayerForm, status: s })}
                      className={`flex-1 py-1 text-sm rounded ${newPlayerForm.status === s ? 'text-white' : 'hover:text-white'}`}
                      style={{ backgroundColor: newPlayerForm.status === s ? currentTheme.accentColor : 'transparent', color: newPlayerForm.status === s ? '#fff' : currentTheme.textMuted }}
                    >{s}</button>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-8">
              <button onClick={() => setIsAddModalOpen(false)} className="flex-1 py-2 rounded border hover:bg-white/5 transition-colors" style={{ borderColor: currentTheme.borderColor }}>Cancel</button>
              <button onClick={addNewPlayer} disabled={!newPlayerForm.name} className="flex-1 py-2 rounded text-white font-bold transition-colors disabled:opacity-50" style={{ backgroundColor: currentTheme.accentColor }}>Add to Roster</button>
            </div>
          </div>
        </div>
      )}

      <div className="flex-1 flex flex-col min-w-0">
        <header className="border-b p-5 shrink-0 z-10 flex items-center justify-between gap-6" style={{ backgroundColor: currentTheme.bgHeader, borderColor: currentTheme.borderColor }}>
          <div className="flex items-center gap-4">
            <div className="p-2 rounded-lg" style={{ backgroundColor: currentTheme.accentColor }}><Layout className="w-5 h-5 text-white" /></div>
            <div>
              <div className="flex items-center gap-2">
                {isEditingTitle ? (
                  <input
                    autoFocus
                    onBlur={() => setIsEditingTitle(false)}
                    onKeyDown={(event) => event.key === 'Enter' && setIsEditingTitle(false)}
                    value={appTitle}
                    onChange={(event) => setAppTitle(event.target.value)}
                    className="text-xl font-bold bg-transparent border-b border-white/20 outline-none"
                    style={{ color: currentTheme.textMain }}
                  />
                ) : (
                  <h1 className="text-xl font-bold tracking-tight cursor-pointer flex items-center gap-2 group" onClick={() => setIsEditingTitle(true)} style={{ color: currentTheme.textMain }}>
                    {appTitle}
                    <Pencil className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity text-slate-500" />
                  </h1>
                )}
              </div>
              <p className="text-xs font-medium" style={{ color: currentTheme.textMuted }}>Roster Management System</p>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <button
              onClick={() => { setIsAIModalOpen(true); handleAIAction('analysis'); }}
              className="flex items-center gap-2 px-3 py-2 rounded border hover:bg-white/5 transition-colors group relative overflow-hidden"
              style={{ borderColor: currentTheme.accentColor, color: currentTheme.textMain }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
              <Sparkles className="w-4 h-4 text-yellow-400" />
              <span className="text-sm font-medium">War Council</span>
            </button>

            <div className="flex items-center bg-white/5 rounded-md border" style={{ borderColor: currentTheme.borderColor }}>
              <button
                onClick={handleExportCSV}
                title="Export to CSV (Google Sheets)"
                className="p-2 hover:bg-white/5 transition-colors border-r"
                style={{ borderColor: currentTheme.borderColor, color: currentTheme.textMuted }}
              >
                <Download className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsImportModalOpen(true)}
                title="Import from Sheets/CSV"
                className="p-2 hover:bg-white/5 transition-colors"
                style={{ color: currentTheme.textMuted }}
              >
                <Upload className="w-4 h-4" />
              </button>
            </div>

            <div className="relative">
              <button
                onClick={() => setIsThemeMenuOpen(!isThemeMenuOpen)}
                className="p-2 rounded hover:bg-white/5 transition-colors"
                title="Change Theme"
              >
                <Palette className="w-5 h-5" style={{ color: currentTheme.textMuted }} />
              </button>

              {isThemeMenuOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setIsThemeMenuOpen(false)}></div>
                  <div className="absolute right-0 top-full mt-2 w-48 rounded-lg shadow-xl border z-20 overflow-hidden" style={{ backgroundColor: currentTheme.bgCard, borderColor: currentTheme.borderColor }}>
                    <div className="p-2 space-y-1">
                      {Object.values(THEMES).map(t => (
                        <button
                          key={t.id}
                          onClick={() => { setCurrentTheme(t); setIsThemeMenuOpen(false); }}
                          className="w-full flex items-center gap-3 px-3 py-2 text-sm rounded transition-colors hover:bg-white/5"
                          style={{ color: currentTheme.textMain }}
                        >
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: t.accentColor }}></div>
                          {t.label}
                          {currentTheme.id === t.id && <CheckCircle2 className="w-3 h-3 ml-auto opacity-50" />}
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>

            <button onClick={() => setIsAddModalOpen(true)} className="flex items-center gap-2 text-white px-4 py-2 rounded-md font-medium text-sm transition-colors shadow-lg shadow-black/20" style={{ backgroundColor: currentTheme.accentColor }}>
              <Plus className="w-4 h-4" /> Add New Player
            </button>
            <div className="h-8 w-px" style={{ backgroundColor: currentTheme.borderColor }}></div>
            <div className="text-right">
              <div className="text-xs uppercase font-bold tracking-wider" style={{ color: currentTheme.textMuted }}>Roster Size</div>
              <div className="text-2xl font-mono font-bold leading-none" style={{ color: currentTheme.textMain }}>{activeRoster.length}</div>
            </div>
            <div className="h-8 w-px" style={{ backgroundColor: currentTheme.borderColor }}></div>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: currentTheme.textMuted }} />
              <input type="text" placeholder="Search roster..."
                className="w-full border rounded-md pl-9 pr-4 py-2 text-sm focus:outline-none"
                style={{ backgroundColor: currentTheme.bgApp, borderColor: currentTheme.borderColor, color: currentTheme.textMain }}
                value={search} onChange={(event) => setSearch(event.target.value)} />
            </div>
          </div>
        </header>

        {buffStatus.missing.length > 0 && (
          <div className="border-b px-5 py-2 flex items-center gap-3 overflow-x-auto shrink-0" style={{ backgroundColor: `${currentTheme.bgCard}80`, borderColor: currentTheme.borderColor }}>
            <span className="text-xs font-bold uppercase tracking-wider shrink-0 text-red-500">Missing:</span>
            {buffStatus.missing.map(key => (
              <div key={key} className="flex items-center gap-1.5 px-2 py-0.5 rounded border shrink-0 bg-red-500/10 border-red-500/20">
                <AlertCircle className="w-3 h-3 text-red-400" />
                <span className="text-xs font-medium text-red-300">{BUFF_RULES[key].label}</span>
              </div>
            ))}
          </div>
        )}

        <div className="flex-1 overflow-y-auto p-5 space-y-6 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
          <section onDragOver={handleDragOver} onDrop={(event) => handleDrop(event, 'Main')} className={`rounded-lg overflow-hidden border-2 transition-colors ${draggedPlayer ? 'border-dashed border-indigo-500/30' : ''}`} style={{ borderColor: currentTheme.borderColor, backgroundColor: draggedPlayer ? `${currentTheme.bgCard}50` : currentTheme.bgHeader }}>
            <SectionHeader title="Main Roster" count={mains.length} colorClass="bg-green-500" />
            <div>
              {mains.map(p => <PlayerRow key={p.id} player={p} />)}
              {mains.length === 0 && <div className="p-8 text-center text-sm italic" style={{ color: currentTheme.textMuted }}>Drag Main Raiders Here</div>}
            </div>
          </section>

          <section onDragOver={handleDragOver} onDrop={(event) => handleDrop(event, 'Trial')} className={`rounded-lg overflow-hidden border-2 transition-colors ${draggedPlayer ? 'border-dashed border-amber-500/30' : ''}`} style={{ borderColor: currentTheme.borderColor, backgroundColor: draggedPlayer ? `${currentTheme.bgCard}50` : currentTheme.bgHeader }}>
            <SectionHeader title="Trials" count={trials.length} colorClass="bg-amber-500" />
            <div>
              {trials.map(p => <PlayerRow key={p.id} player={p} />)}
              {trials.length === 0 && <div className="p-4 text-center text-sm italic" style={{ color: currentTheme.textMuted }}>No active trials</div>}
            </div>
          </section>

          <section onDragOver={handleDragOver} onDrop={(event) => handleDrop(event, 'Backup')} className={`rounded-lg overflow-hidden border-2 transition-colors ${draggedPlayer ? 'border-dashed border-slate-500/30' : ''}`} style={{ borderColor: currentTheme.borderColor, backgroundColor: draggedPlayer ? `${currentTheme.bgCard}50` : currentTheme.bgHeader }}>
            <SectionHeader title="Bench / Backup" count={backups.length} colorClass="bg-slate-500" />
            <div>
              {backups.map(p => <PlayerRow key={p.id} player={p} />)}
              {backups.length === 0 && <div className="p-4 text-center text-sm italic" style={{ color: currentTheme.textMuted }}>Bench empty</div>}
            </div>
          </section>
        </div>
      </div>

      <div
        onMouseDown={startResizing}
        className={`w-1.5 cursor-col-resize hover:bg-indigo-500 transition-colors z-20 flex items-center justify-center group ${isResizing ? 'bg-indigo-500' : ''}`}
        style={{ backgroundColor: currentTheme.borderColor }}
      >
        <div className="h-8 w-0.5 group-hover:bg-indigo-200 rounded-full" style={{ backgroundColor: currentTheme.textMuted }}></div>
      </div>

      <aside
        style={{ width: sidebarWidth, backgroundColor: currentTheme.bgHeader }}
        className="overflow-y-auto flex flex-col shrink-0"
      >
        <div className="p-5 border-b" style={{ borderColor: currentTheme.borderColor, backgroundColor: currentTheme.bgApp }}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-bold uppercase tracking-widest" style={{ color: currentTheme.textMuted }}>Role Counts</h3>
            <span className="text-[10px]" style={{ color: currentTheme.textMuted }}>(Main + Trial)</span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded p-2 flex items-center justify-between border border-blue-900/30" style={{ backgroundColor: currentTheme.bgCard }}>
              <div className="flex items-center gap-2"><Shield className="w-4 h-4 text-blue-400" /><span className="text-sm font-medium text-blue-200">Tank</span></div>
              <span className="font-mono font-bold text-white">{roleCounts.Tank}</span>
            </div>
            <div className="rounded p-2 flex items-center justify-between border border-green-900/30" style={{ backgroundColor: currentTheme.bgCard }}>
              <div className="flex items-center gap-2"><Cross className="w-4 h-4 text-green-400" /><span className="text-sm font-medium text-green-200">Healer</span></div>
              <span className="font-mono font-bold text-white">{roleCounts.Healer}</span>
            </div>
            <div className="rounded p-2 flex items-center justify-between border border-red-900/30" style={{ backgroundColor: currentTheme.bgCard }}>
              <div className="flex items-center gap-2"><Swords className="w-4 h-4 text-red-400" /><span className="text-sm font-medium text-red-200">Melee</span></div>
              <span className="font-mono font-bold text-white">{roleCounts.Melee}</span>
            </div>
            <div className="rounded p-2 flex items-center justify-between border border-amber-900/30" style={{ backgroundColor: currentTheme.bgCard }}>
              <div className="flex items-center gap-2"><Zap className="w-4 h-4 text-amber-400" /><span className="text-sm font-medium text-amber-200">Ranged</span></div>
              <span className="font-mono font-bold text-white">{roleCounts.Ranged}</span>
            </div>
          </div>
        </div>

        <div className="p-5 border-b" style={{ borderColor: currentTheme.borderColor }}>
          <h3 className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: currentTheme.textMuted }}>Class Distribution</h3>
          <table className="w-full text-sm">
            <tbody className="divide-y" style={{ borderColor: `${currentTheme.borderColor}80` }}>
              {classCounts.map(({ name, count }) => (
                <tr key={name} className="transition-colors group hover:bg-white/5">
                  <td className="px-1 py-1.5 flex items-center gap-2">
                    <div className="w-2 h-2 rounded-sm" style={{ backgroundColor: CLASS_COLORS[name] }}></div>
                    <span style={{ color: count > 0 ? currentTheme.textMain : currentTheme.textMuted }}>{name}</span>
                  </td>
                  <td className="px-1 py-1.5 text-right font-mono">
                    {count > 0 ? (
                      <span className="px-1.5 py-0.5 rounded border text-xs" style={{ backgroundColor: currentTheme.bgCard, borderColor: currentTheme.borderColor, color: currentTheme.textMain }}>{count}</span>
                    ) : (
                      <span className="text-xs" style={{ color: currentTheme.textMuted }}>-</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="p-5">
          <h3 className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: currentTheme.textMuted }}>Coverage Checklist</h3>
          <div className="space-y-4">
            <div>
              <div className="text-[10px] uppercase font-bold mb-2" style={{ color: currentTheme.textMuted }}>Standard Buffs</div>
              <div className="space-y-1">
                {Object.entries(BUFF_RULES).filter(([, r]) => r.type === 'buff').map(([key, rule]) => {
                  const isPresent = buffStatus.present.has(key);
                  return (
                    <div key={key} className="flex items-center justify-between text-xs py-0.5">
                      <span style={{ color: isPresent ? currentTheme.textMain : currentTheme.textMuted }}>{rule.label}</span>
                      {isPresent ? <CheckCircle2 className="w-3.5 h-3.5 text-green-500" /> : <div className="w-3.5 h-3.5 border rounded-full" style={{ borderColor: currentTheme.textMuted }}></div>}
                    </div>
                  );
                })}
              </div>
            </div>

            <div>
              <div className="text-[10px] uppercase font-bold mb-2" style={{ color: currentTheme.textMuted }}>Raid Utility</div>
              <div className="space-y-1">
                {Object.entries(BUFF_RULES).filter(([, r]) => r.type === 'utility').map(([key, rule]) => {
                  const isPresent = buffStatus.present.has(key);
                  return (
                    <div key={key} className="flex items-center justify-between text-xs py-0.5">
                      <span style={{ color: isPresent ? currentTheme.textMain : currentTheme.textMuted }}>{rule.label}</span>
                      {isPresent ? <CheckCircle2 className="w-3.5 h-3.5 text-green-500" /> : <div className="w-3.5 h-3.5 border rounded-full" style={{ borderColor: currentTheme.textMuted }}></div>}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
}
