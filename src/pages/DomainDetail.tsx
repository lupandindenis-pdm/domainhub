import { useState, useEffect, useRef } from "react";

import { useParams, useNavigate } from "react-router-dom";

import { mockDomains, mockLabels } from "@/data/mockDomains";

import { DomainTypeBadge } from "@/components/domains/DomainTypeBadge";

import { DomainStatusBadge } from "@/components/domains/DomainStatusBadge";

import { LabelBadge } from "@/components/domains/LabelBadge";

import { LabelSelector } from "@/components/domains/LabelSelector";

import { Button } from "@/components/ui/button";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { Badge } from "@/components/ui/badge";

import { Separator } from "@/components/ui/separator";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

import { Input } from "@/components/ui/input";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import * as SelectPrimitive from "@radix-ui/react-select";

import { Switch } from "@/components/ui/switch";

import { Label } from "@/components/ui/label";

import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";

import { Calendar } from "@/components/ui/calendar";

import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

import { Textarea } from "@/components/ui/textarea";

import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";

import { cn } from "@/lib/utils";

import { projects, departments, marketingCategories, departmentConfig, bonusTypes, marketingDirections, needsUpdateOptions, targetActions } from "@/data/mockDomains";
import { DOMAIN_TYPE_LABELS, DOMAIN_TYPES, DOMAIN_TYPE_CONFIG, DOMAIN_STATUS_CONFIG, DOMAIN_STATUS_LABELS } from "@/constants/domainTypes";

import { 

  ArrowLeft, 

  ExternalLink, 

  Edit, 

  Copy, 

  Globe, 

  Server, 

  Shield, 

  Calendar as CalendarIcon, 

  AlertCircle, 

  AlertTriangle, 

  Megaphone, 

  BarChart3, 

  Users, 

  User,

  Layers, 

  Code2, 

  RotateCcw, 

  FileText, 

  ChevronsUpDown,

  CheckCircle,

  Ban,

  Activity,

  Tag,

  Check,

  Trash2

} from "lucide-react";

import { format, parseISO, differenceInDays } from "date-fns";

import { ru } from "date-fns/locale";

import { toast } from "sonner";

import { useLanguage } from "@/components/language-provider";

import DomainDetailV1 from "./DomainDetailV1";

import { GeoMultiSelector } from "@/components/domains/GeoMultiSelector";

import { getGeoColor } from "@/data/geoColors";



export default function DomainDetail() {

  const { id } = useParams();

  const navigate = useNavigate();

  const { t } = useLanguage();

  

  // Определяем режим создания нового домена
  const isNewDomain = id === 'new';

  const domain = isNewDomain ? null : mockDomains.find((d) => d.id === id);


  

  const [version, setVersion] = useState<'v1' | 'v2'>('v2');

  const [isDescriptionOpen, setIsDescriptionOpen] = useState(false);

  const [isMarketingNoteOpen, setIsMarketingNoteOpen] = useState(false);

  const [isItNoteOpen, setIsItNoteOpen] = useState(false);

  const [isAnalyticsNoteOpen, setIsAnalyticsNoteOpen] = useState(false);

  const [isPartnershipNoteOpen, setIsPartnershipNoteOpen] = useState(false);

  const [isIntegrationsNoteOpen, setIsIntegrationsNoteOpen] = useState(false);

  // Для нового домена сразу включаем режим редактирования
  const [isEditing, setIsEditing] = useState(isNewDomain);

  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const [domainError, setDomainError] = useState<string>('');

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const editableDivRef = useRef<HTMLDivElement>(null);

  // Normalize category and bonus values - if not in list, use default
  const normalizeValue = (value: string, list: string[]) => {
    if (!value) return list[0] || '';
    return list.includes(value) ? value : list[0] || '';
  };

  

  // Form data state - дефолтные значения для нового домена

  const getDefaultFormData = () => {
    if (isNewDomain) {
      return {
        name: '',
        type: 'unknown',
        status: 'unknown',
        geo: [],
        blockedGeo: [],
        department: 'Other',
        project: 'Не известно',
        category: 'Нет категории',
        direction: 'Не выбрано',
        targetAction: 'Не выбрано',
        bonus: 'Нет бонуса',
        needsUpdate: 'Нет',
        jiraTask: '',
        fileHosting: '',
        registrar: '',
        nsServers: [],
        techIssues: [],
        hasTechIssues: 'Нет',
        jiraTaskIT: '',
        testMethod: 'Не известно',
        purchaseDate: '',
        renewalDate: '',
        gaId: '',
        gtmId: '',
        isInProgram: false,
        isInProgramStatus: 'Нет',
        programLink: '',
        companyName: '',
        programStatus: 'Не известно',
        oneSignalId: '',
        cloudflareAccount: '',
        description: '',
        marketingNote: '',
        itNote: '',
        analyticsNote: '',
        partnershipNote: '',
        integrationsNote: '',
        labelId: undefined,
      };
    }
    return {
      name: domain?.name || '',
      type: domain?.type || '',
      status: domain?.status || '',
      geo: domain?.geo || [],
      blockedGeo: domain?.blockedGeo || [],
      department: domain?.department || '',
      project: domain?.project || '',
      category: normalizeValue(domain?.category || '', marketingCategories),
      direction: domain?.direction || "Не выбрано",
      targetAction: domain?.targetAction || "Не выбрано",
      bonus: normalizeValue(domain?.bonus || '', bonusTypes),
      needsUpdate: domain?.needsUpdate || "Нет",
      jiraTask: domain?.jiraTask || '',
      fileHosting: domain?.fileHosting || '',
      registrar: domain?.registrar || '',
      nsServers: domain?.nsServers || [],
      techIssues: domain?.techIssues || [],
      hasTechIssues: domain?.techIssues && domain.techIssues.length > 0 ? "Да" : "Нет",
      jiraTaskIT: Array.isArray(domain?.jiraTaskIT) ? domain.jiraTaskIT.join(', ') : (domain?.jiraTaskIT || ''),
      testMethod: domain?.testMethod || 'Не известно',
      purchaseDate: domain?.purchaseDate || '',
      renewalDate: domain?.renewalDate || '',
      gaId: domain?.gaId || '',
      gtmId: domain?.gtmId || '',
      isInProgram: domain?.isInProgram || false,
      isInProgramStatus: domain?.isInProgram ? "Да" : (domain?.isInProgramStatus || "Не известно"),
      programLink: domain?.programLink || '',
      companyName: domain?.companyName || '',
      programStatus: domain?.programStatus || 'Не известно',
      oneSignalId: domain?.oneSignalId || '',
      cloudflareAccount: domain?.cloudflareAccount || '',
      description: domain?.description || '',
      marketingNote: '',
      itNote: '',
      analyticsNote: '',
      partnershipNote: '',
      integrationsNote: '',
      labelId: domain?.labelId,
    };
  };

  const [formData, setFormData] = useState(getDefaultFormData());

  

  // Load labels from localStorage or use defaults

  const [labels, setLabels] = useState(() => {

    try {

      const saved = localStorage.getItem('domainLabels');

      return saved ? JSON.parse(saved) : mockLabels;

    } catch {

      return mockLabels;

    }

  });

  

  // Auto-resize textarea

  useEffect(() => {

    if (textareaRef.current && isEditing) {

      textareaRef.current.style.height = 'auto';

      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';

    }

  }, [formData.name, isEditing]);

  // Set initial value for contentEditable div
  useEffect(() => {
    if (editableDivRef.current && isEditing) {
      if (editableDivRef.current.textContent !== formData.name) {
        editableDivRef.current.textContent = formData.name;
      }
    }
  }, [isEditing]);

  

  // Load domain label assignment from localStorage

  const [domainLabelId, setDomainLabelId] = useState(() => {

    try {

      const saved = localStorage.getItem('domainLabelAssignments');

      if (saved && id) {

        const assignments = JSON.parse(saved);

        return assignments[id] || domain?.labelId;

      }

    } catch {

      return domain?.labelId;

    }

    return domain?.labelId;

  });



  // Save labels to localStorage whenever they change

  useEffect(() => {

    try {

      localStorage.setItem('domainLabels', JSON.stringify(labels));

    } catch (error) {

      console.error('Failed to save labels to localStorage:', error);

    }

  }, [labels]);



  // Save domain label assignment to localStorage whenever it changes

  useEffect(() => {

    if (!id) return;

    

    try {

      const saved = localStorage.getItem('domainLabelAssignments');

      const assignments = saved ? JSON.parse(saved) : {};

      

      if (domainLabelId) {

        assignments[id] = domainLabelId;

      } else {

        delete assignments[id];

      }

      

      localStorage.setItem('domainLabelAssignments', JSON.stringify(assignments));

    } catch (error) {

      console.error('Failed to save domain label assignment to localStorage:', error);

    }

  }, [id, domainLabelId]);



  // Validate domain name

  const validateDomain = (domain: string): string => {

    if (!domain || domain.trim() === '') {

      return 'Домен не может быть пустым';

    }

    

    // Remove protocol and www if present for validation

    let cleanDomain = domain.trim();

    cleanDomain = cleanDomain.replace(/^https?:\/\//, '');

    cleanDomain = cleanDomain.replace(/^www\./, '');

    cleanDomain = cleanDomain.replace(/\/$/, '');

    

    // Check for spaces

    if (cleanDomain.includes(' ')) {

      return 'Домен не может содержать пробелы';

    }

    

    // Check for invalid characters

    const invalidChars = /[^a-zA-Z0-9.\/:#?&=_-]/;

    if (invalidChars.test(cleanDomain)) {

      return 'Домен содержит недопустимые символы';

    }

    

    // Check if domain has at least one dot (unless it's localhost)

    if (!cleanDomain.includes('.') && !cleanDomain.startsWith('localhost')) {

      return 'Домен должен содержать хотя бы одну точку (например: example.com)';

    }

    

    // Check domain length

    if (cleanDomain.length > 253) {

      return 'Домен слишком длинный (максимум 253 символа)';

    }

    

    // Check if domain starts or ends with dash or dot

    const parts = cleanDomain.split('/');

    const domainPart = parts[0];

    if (domainPart.startsWith('-') || domainPart.endsWith('-') || domainPart.startsWith('.') || domainPart.endsWith('.')) {

      return 'Домен не может начинаться или заканчиваться дефисом или точкой';

    }

    

    return '';

  };



  // Handle form field changes

  const handleFieldChange = (field: string, value: any) => {

    setFormData(prev => ({ ...prev, [field]: value }));

    

    // Validate domain name on change

    if (field === 'name') {

      const error = validateDomain(value);

      setDomainError(error);

    }

  };



  // Handle save

  const handleSave = () => {

    // Validate domain before saving

    const error = validateDomain(formData.name);

    if (error) {

      setDomainError(error);

      toast.error(error, {
        style: {
          color: '#EAB308',
        },
      });

      return;

    }

    

    // Save to localStorage or API

    try {

      // Clean domain name - remove https://, http://, www.

      let cleanedName = formData.name.trim();

      cleanedName = cleanedName.replace(/^https?:\/\//, '');

      cleanedName = cleanedName.replace(/^www\./, '');

      cleanedName = cleanedName.replace(/\/$/, ''); // Remove trailing slash

      

      const savedDomains = localStorage.getItem('editedDomains');

      const editedDomains = savedDomains ? JSON.parse(savedDomains) : {};

      const updatedAt = new Date().toISOString();

      

      // Для нового домена генерируем ID и перенаправляем

      if (isNewDomain) {
        const newId = `new-${Date.now()}`;
        editedDomains[newId] = { ...formData, name: cleanedName, updatedAt, id: newId };
        localStorage.setItem('editedDomains', JSON.stringify(editedDomains));
        
        toast.success('Домен создан');
        navigate(`/domains/${newId}`);
        return;
      }

      editedDomains[id!] = { ...formData, name: cleanedName, updatedAt };

      localStorage.setItem('editedDomains', JSON.stringify(editedDomains));

      

      // Update form data with cleaned name and updatedAt

      setFormData(prev => ({ ...prev, name: cleanedName, updatedAt }));

      

      setDomainError('');

      toast.success('Изменения сохранены');

      setIsEditing(false);

    } catch (error) {

      toast.error('Ошибка при сохранении');

      console.error(error);

    }

  };



  // Handle cancel

  const handleCancel = () => {

    // Clear validation error

    setDomainError('');

    

    // Load saved data from localStorage or use original domain data

    try {

      const savedDomains = localStorage.getItem('editedDomains');

      if (savedDomains && id) {

        const editedDomains = JSON.parse(savedDomains);

        if (editedDomains[id]) {

          setFormData(editedDomains[id]);

          setIsEditing(false);

          return;

        }

      }

    } catch (error) {

      console.error('Failed to load saved data:', error);

    }

    

    // If no saved data, reset to original domain data

    setFormData({

      name: domain?.name || '',

      type: domain?.type || '',

      status: domain?.status || '',

      geo: domain?.geo || [],

      blockedGeo: domain?.blockedGeo || [],

      department: domain?.department || '',

      project: domain?.project || '',

      category: normalizeValue(domain?.category || '', marketingCategories),

      direction: domain?.direction || "Не выбрано",

      targetAction: domain?.targetAction || "Не выбрано",

      bonus: normalizeValue(domain?.bonus || '', bonusTypes),

      needsUpdate: domain?.needsUpdate || "Нет",

      jiraTask: domain?.jiraTask || '',

      fileHosting: domain?.fileHosting || '',

      registrar: domain?.registrar || '',

      nsServers: domain?.nsServers || [],

      techIssues: domain?.techIssues || [],

      hasTechIssues: domain?.techIssues && domain.techIssues.length > 0 ? "Да" : "Нет",

      jiraTaskIT: Array.isArray(domain?.jiraTaskIT) ? domain.jiraTaskIT.join(', ') : (domain?.jiraTaskIT || ''),

      testMethod: domain?.testMethod || 'Не известно',

      purchaseDate: domain?.purchaseDate || '',

      renewalDate: domain?.renewalDate || '',

      gaId: domain?.gaId || '',

      gtmId: domain?.gtmId || '',

      isInProgram: domain?.isInProgram || false,

      isInProgramStatus: domain?.isInProgram ? "Да" : (domain?.isInProgramStatus || "Не известно"),

      programLink: domain?.programLink || '',

      companyName: domain?.companyName || '',

      programStatus: domain?.programStatus || 'Не известно',

      oneSignalId: domain?.oneSignalId || '',

      cloudflareAccount: domain?.cloudflareAccount || '',

      description: domain?.description || '',

      marketingNote: '',

      itNote: '',

      analyticsNote: '',

      partnershipNote: '',

      integrationsNote: '',

      labelId: domain?.labelId

    });

    setIsEditing(false);

  };



  // Load edited data from localStorage or reset to domain data

  useEffect(() => {

    // Для нового домена не загружаем данные
    if (isNewDomain) return;

    if (!id || !domain) return;

    

    // Always start with actual data from mockDomains
    const baseData = {
      name: domain.name || '',
      type: domain.type || '',
      status: domain.status || '',
      geo: domain.geo || [],
      blockedGeo: domain.blockedGeo || [],
      department: domain.department || '',
      project: domain.project || '',
      category: normalizeValue(domain.category || '', marketingCategories),
      direction: domain.direction || "Не выбрано",
      targetAction: domain.targetAction || "Не выбрано",
      bonus: normalizeValue(domain.bonus || '', bonusTypes),
      needsUpdate: domain.needsUpdate || "Нет",
      jiraTask: domain.jiraTask || '',
      fileHosting: domain.fileHosting || '',
      registrar: domain.registrar || '',
      nsServers: domain.nsServers || [],
      techIssues: domain.techIssues || [],
      hasTechIssues: domain.techIssues && domain.techIssues.length > 0 ? "Да" : "Нет",
      jiraTaskIT: Array.isArray(domain.jiraTaskIT) ? domain.jiraTaskIT.join(', ') : (domain.jiraTaskIT || ''),
      testMethod: domain.testMethod || 'Не известно',
      purchaseDate: domain.purchaseDate || '',
      renewalDate: domain.renewalDate || '',
      gaId: domain.gaId || '',
      gtmId: domain.gtmId || '',
      isInProgram: domain.isInProgram || false,
      isInProgramStatus: domain.isInProgram ? "Да" : (domain.isInProgramStatus || "Не известно"),
      programLink: domain.programLink || '',
      companyName: domain.companyName || '',
      programStatus: domain.programStatus || 'Не известно',
      oneSignalId: domain.oneSignalId || '',
      cloudflareAccount: domain.cloudflareAccount || '',
      description: domain?.description || '',
      marketingNote: '',
      itNote: '',
      analyticsNote: '',
      partnershipNote: '',
      integrationsNote: '',
      labelId: domain.labelId
    };

    try {
      const savedDomains = localStorage.getItem('editedDomains');
      if (savedDomains) {
        const editedDomains = JSON.parse(savedDomains);
        if (editedDomains[id]) {
          // Merge saved edits with actual mockDomains data
          setFormData({ ...baseData, ...editedDomains[id] });
          return;
        }
      }
    } catch (error) {
      console.error('Failed to load edited data:', error);
    }

    // If no saved data, use base data from mockDomains
    setFormData(baseData);

  }, [id, domain]);



  // Для нового домена не показываем ошибку "не найден"
  if (!isNewDomain && !domain) {

    return (

      <div className="flex flex-col items-center justify-center py-12">

        <p className="text-lg font-medium">Домен не найден</p>

        <Button variant="link" onClick={() => navigate("/domains")}>

          Вернуться к списку

        </Button>

      </div>

    );

  }



  const daysLeft = domain ? differenceInDays(parseISO(domain.expirationDate), new Date()) : 0;



  const statusColors: Record<string, string> = {

    actual: "bg-emerald-500/20 text-emerald-700 dark:text-emerald-300",

    spare: "bg-indigo-500/20 text-indigo-700 dark:text-indigo-300",

    not_actual: "bg-rose-500/20 text-rose-700 dark:text-rose-300",

    not_configured: "bg-slate-500/20 text-slate-700 dark:text-slate-300",

    unknown: "bg-amber-500/20 text-amber-700 dark:text-amber-300",

    expiring: "bg-orange-500/20 text-orange-700 dark:text-orange-300",

    expired: "bg-red-500/20 text-red-700 dark:text-red-300",

    blocked: "bg-red-500/20 text-red-700 dark:text-red-300",

    test: "bg-purple-500/20 text-purple-700 dark:text-purple-300",

  };

  

  const typeColors: Record<string, string> = {

    site: "bg-blue-500/20 text-blue-700 dark:text-blue-300",

    product: "bg-emerald-500/20 text-emerald-700 dark:text-emerald-300",

    landing: "bg-violet-500/20 text-violet-700 dark:text-violet-300",

    mirror: "bg-amber-500/20 text-amber-700 dark:text-amber-300",

    seo: "bg-pink-500/20 text-pink-700 dark:text-pink-300",

    referral: "bg-orange-500/20 text-orange-700 dark:text-orange-300",

    redirect: "bg-indigo-500/20 text-indigo-700 dark:text-indigo-300",

    technical: "bg-slate-500/20 text-slate-700 dark:text-slate-300",

    subdomain: "bg-cyan-500/20 text-cyan-700 dark:text-cyan-300",

    b2b: "bg-teal-500/20 text-teal-700 dark:text-teal-300",

    unknown: "bg-gray-500/20 text-gray-700 dark:text-gray-300",

  };



  const statusColorClass = statusColors[formData.status || domain?.status || 'unknown'] || "bg-muted/50";

  const typeColorClass = typeColors[formData.type || domain?.type || 'unknown'] || "bg-muted/50";



  return (

    <div className="container py-6 space-y-6 max-w-7xl mx-auto" style={{ scrollbarGutter: "stable" }}>

      {/* Top Navigation & Header */}

      <div className="flex flex-col gap-4">

        <div className="flex flex-col gap-2 min-w-0">

          <div className="flex items-center gap-3 min-w-0 justify-between">

            <div className="flex items-center gap-3 min-w-0 flex-1">

              <Button variant="ghost" size="icon" onClick={() => navigate("/domains")} className="flex-shrink-0">

                <ArrowLeft className="h-5 w-5" />

              </Button>

              <div className="flex-1 min-w-0 max-w-md">

                <div className="relative">

                  {isEditing ? (

                    <div className="space-y-1">

                      <div

                        ref={editableDivRef}

                        contentEditable

                        suppressContentEditableWarning

                        onInput={(e) => {

                          const text = e.currentTarget.textContent || '';

                          handleFieldChange('name', text);

                        }}

                        className="text-2xl font-bold font-mono tracking-tight bg-transparent outline-none px-2 w-full transition-colors break-all text-green-400"

                        style={{ textWrap: 'balance' }}

                        data-placeholder={isNewDomain && !formData.name ? "Введите имя домена..." : ""}

                      />

                      {domainError && (

                        <div className="flex items-center gap-1 text-amber-500 text-sm px-2">

                          <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" />

                          <span>{domainError}</span>

                        </div>

                      )}

                    </div>

                  ) : (

                    <div 

                      className="text-2xl font-bold font-mono tracking-tight cursor-pointer hover:text-yellow-400/80 transition-colors break-all px-2"

                      style={{ textWrap: 'balance' }}

                      onClick={() => {

                        try {

                          navigator.clipboard.writeText(formData.name || domain?.name || '');

                          toast.success("Домен скопирован в буфер обмена");

                        } catch (error) {

                          toast.error("Ошибка копирования");

                        }

                      }}

                      onDoubleClick={() => {

                        window.open(`https://${formData.name || domain?.name || ''}`, "_blank");

                      }}

                    >

                      {formData.name || domain?.name || ''}

                    </div>

                  )}

                </div>

              </div>

            </div>

          </div>

          <div className="flex items-center gap-2 pl-14 mt-2">

            {(formData.hasTechIssues === "Да" || (formData.needsUpdate && formData.needsUpdate !== "Нет")) && (

              <Badge variant="secondary" className="bg-yellow-500/10 text-yellow-600 border-0 gap-1 h-6 flex-shrink-0 whitespace-nowrap">

                <AlertTriangle className="h-3 w-3" /> Требует обновления

              </Badge>

            )}

            {formData.blockedGeo && formData.blockedGeo.length > 0 && (

              <Badge variant="destructive" className="gap-1 h-6 flex-shrink-0 whitespace-nowrap">

                <Globe className="h-3 w-3" /> GEO Block

              </Badge>

            )}

          </div>


        </div>



        <div className="flex items-center gap-2 justify-end">

          {!isEditing ? (

            <>

              <div className="min-w-[144px] flex justify-end">

                <LabelSelector

                  currentLabelId={domainLabelId}

                  labels={labels}

                  onLabelChange={(labelId) => {

                    setDomainLabelId(labelId);

                  }}

                  onCreateLabel={(name, color) => {

                    const newLabel = {

                      id: `label-${Date.now()}`,

                      name,

                      color,

                      projectId: domain?.project || formData.project || '',

                    };

                    setLabels([...labels, newLabel]);

                    setDomainLabelId(newLabel.id);

                  }}

                  onUpdateLabel={(labelId, name, color) => {

                    setLabels(labels.map(l => 

                      l.id === labelId 

                        ? { ...l, name, color }

                        : l

                    ));

                  }}

                  onDeleteLabel={(labelId) => {

                    setLabels(labels.filter(l => l.id !== labelId));

                    if (domainLabelId === labelId) {

                      setDomainLabelId(undefined);

                    }

                  }}

                />

              </div>

              <Button onClick={() => setIsEditing(true)} className="gap-2 w-[144px]">

                <Edit className="h-4 w-4" />

                Редактировать

              </Button>

            </>

          ) : (

            <>

              <Button 

                onClick={(e) => {

                  e.preventDefault();

                  e.stopPropagation();

                  handleCancel();

                }} 

                variant="outline" 

                className="gap-2 w-[144px]"

              >

                Отмена

              </Button>

              <Button onClick={handleSave} className="gap-2 bg-green-600 hover:bg-green-700 w-[144px]">

                <CheckCircle className="h-4 w-4" />

                Сохранить

              </Button>

            </>

          )}

        </div>

      </div>



      {/* Main Content Tabs */}

      <Tabs defaultValue="general" className={cn("space-y-6 mt-12", isEditing && "editing-mode")}>

        <TabsList className="flex h-auto flex-wrap gap-2 bg-transparent p-0 justify-start pl-6 mt-4">

          <TabsTrigger value="general" className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:border-primary/50 border border-border px-4 py-2 rounded-md transition-colors bg-card hover:bg-accent">

            Общая информация

          </TabsTrigger>

          <TabsTrigger value="department" className="data-[state=active]:bg-purple-500/10 data-[state=active]:text-purple-600 data-[state=active]:border-purple-500/50 border border-border px-4 py-2 rounded-md transition-colors bg-card hover:bg-accent">

            Отдел

          </TabsTrigger>

          <TabsTrigger value="integrations" className="data-[state=active]:bg-orange-500/10 data-[state=active]:text-orange-600 data-[state=active]:border-orange-500/50 border border-border px-4 py-2 rounded-md transition-colors bg-card hover:bg-accent">

            Интеграции

          </TabsTrigger>

        </TabsList>



        {/* 1. GENERAL TAB (Merged Overview + General) */}

        <TabsContent value="general" className="space-y-4">

          <div className="w-full">

            <div className="p-6 space-y-8">

              {/* Two columns for remaining fields */}

              <div className="grid gap-8 md:grid-cols-2">

                {/* Column 1: Тип, GEO исп, Проект */}

                <div className="space-y-5">

                  <div className="space-y-2">

                    <label className="text-sm leading-none text-muted-foreground flex items-center gap-2">

                      <Tag className={`h-4 w-4 ${isEditing ? '!text-green-600' : ''}`} />

                      Тип

                    </label>

                    {isEditing ? (

                      <Select value={formData.type} onValueChange={(value) => handleFieldChange('type', value)}>

                        <SelectTrigger className="bg-muted/50">

                          <SelectValue />

                        </SelectTrigger>

                        <SelectContent>

                          {Object.entries(DOMAIN_TYPE_CONFIG).map(([value, config]) => {
                            const Icon = config.icon;
                            return (
                              <SelectPrimitive.Item
                                key={value}
                                value={value}
                                className={cn(
                                  "relative flex w-full cursor-pointer select-none items-center rounded-sm py-1.5 px-2 text-sm outline-none transition-colors",
                                  "focus:bg-violet-500/10",
                                  "data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
                                  formData.type === value && "bg-violet-500/10"
                                )}
                              >
                                <div className="flex items-center gap-2">
                                  <Icon className="h-4 w-4" />
                                  <SelectPrimitive.ItemText>{config.label}</SelectPrimitive.ItemText>
                                </div>
                              </SelectPrimitive.Item>
                            );
                          })}

                        </SelectContent>

                      </Select>

                    ) : (

                      <div className={cn("flex items-center h-10 px-3 rounded-md border-none text-sm truncate", typeColorClass)}>

                        {DOMAIN_TYPE_LABELS[formData.type || domain?.type || 'unknown']}

                      </div>

                    )}

                  </div>



                  <div className="space-y-2">

                    <label className="text-sm leading-none text-muted-foreground flex items-center gap-2">

                      <Globe className={`h-4 w-4 ${isEditing ? '!text-green-600' : ''}`} />

                      GEO (используется)

                    </label>

                    {isEditing ? (

                      <GeoMultiSelector

                        selected={Array.isArray(formData.geo) ? formData.geo : [formData.geo].filter(Boolean)}

                        onChange={(selected) => handleFieldChange('geo', selected)}

                      />

                    ) : (

                      <ReadOnlyGeoView selected={Array.isArray(formData.geo) ? formData.geo : [formData.geo].filter(Boolean)} />

                    )}

                  </div>



                  <div className="space-y-2">

                    <label className="text-sm leading-none text-muted-foreground flex items-center gap-2">

                      <BarChart3 className={`h-4 w-4 ${isEditing ? '!text-green-600' : ''}`} />

                      Проект

                    </label>

                    {isEditing ? (

                      <Select value={formData.project} onValueChange={(value) => handleFieldChange('project', value)}>

                        <SelectTrigger className="bg-muted/50">

                          <SelectValue />

                        </SelectTrigger>

                        <SelectContent>

                          {projects.map((project) => (

                            <SelectPrimitive.Item

                              key={project}

                              value={project}

                              className={cn(

                                "relative flex w-full cursor-pointer select-none items-center rounded-sm py-1.5 px-2 text-sm outline-none transition-colors",

                                "focus:bg-violet-500/10",

                                "data-[disabled]:pointer-events-none data-[disabled]:opacity-50",

                                formData.project === project && "bg-violet-500/10"

                              )}

                            >

                              <SelectPrimitive.ItemText>{project}</SelectPrimitive.ItemText>

                            </SelectPrimitive.Item>

                          ))}

                        </SelectContent>

                      </Select>

                    ) : (

                      <Input 

                        value={formData.project || domain?.project || ''} 

                        readOnly

                        className="bg-muted/50 text-base border-none focus-visible:ring-0" 

                      />

                    )}

                  </div>

                </div>

                {/* Column 2: Статус, GEO блок, Отдел */}

                <div className="space-y-5">

                  <div className="space-y-2">

                    <label className="text-sm leading-none text-muted-foreground flex items-center gap-2">

                      <Activity className={`h-4 w-4 ${isEditing ? '!text-green-600' : ''}`} />

                      Статус

                    </label>

                    {isEditing ? (

                      <Select value={formData.status} onValueChange={(value) => handleFieldChange('status', value)}>

                        <SelectTrigger className="bg-muted/50">

                          <SelectValue />

                        </SelectTrigger>

                        <SelectContent>

                          {Object.entries(DOMAIN_STATUS_CONFIG).map(([value, config]) => {
                            const Icon = config.icon;
                            return (
                              <SelectPrimitive.Item
                                key={value}
                                value={value}
                                className={cn(
                                  "relative flex w-full cursor-pointer select-none items-center rounded-sm py-1.5 px-2 text-sm outline-none transition-colors",
                                  "focus:bg-violet-500/10",
                                  "data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
                                  formData.status === value && "bg-violet-500/10"
                                )}
                              >
                                <div className="flex items-center gap-2">
                                  <Icon className="h-4 w-4" />
                                  <SelectPrimitive.ItemText>{config.label}</SelectPrimitive.ItemText>
                                </div>
                              </SelectPrimitive.Item>
                            );
                          })}

                        </SelectContent>

                      </Select>

                    ) : (

                      <div className={cn("flex items-center h-10 px-3 rounded-md border-none", statusColorClass)}>

                        <span className="text-sm">

                           {DOMAIN_STATUS_LABELS[formData.status || domain?.status || 'unknown']}

                        </span>

                      </div>

                    )}

                  </div>



                  <div className="space-y-2">

                    <label className="text-sm leading-none text-muted-foreground flex items-center gap-2">

                      <Ban className={`h-4 w-4 ${isEditing ? '!text-green-600' : ''}`} />

                      GEO (блокировка)

                    </label>

                    {isEditing ? (

                      <GeoMultiSelector

                        selected={formData.blockedGeo || []}

                        onChange={(selected) => handleFieldChange('blockedGeo', selected)}

                      />

                    ) : (

                      <ReadOnlyGeoView 

                        selected={formData.blockedGeo || domain?.blockedGeo || []} 

                      />

                    )}

                  </div>



                  <div className="space-y-2">

                    <label className="text-sm leading-none text-muted-foreground flex items-center gap-2">

                      <Users className={`h-4 w-4 ${isEditing ? '!text-green-600' : ''}`} />

                      Отдел

                    </label>

                    {isEditing ? (

                      <Select value={formData.department} onValueChange={(value) => handleFieldChange('department', value)}>

                        <SelectTrigger className="bg-muted/50">

                          <SelectValue />

                        </SelectTrigger>

                        <SelectContent>

                          {departments.map((dept) => {
                            const Icon = departmentConfig[dept]?.icon;
                            return (
                              <SelectPrimitive.Item

                                key={dept}

                                value={dept}

                                className={cn(

                                  "relative flex w-full cursor-pointer select-none items-center rounded-sm py-1.5 px-2 text-sm outline-none transition-colors",

                                  "focus:bg-violet-500/10",

                                  "data-[disabled]:pointer-events-none data-[disabled]:opacity-50",

                                  formData.department === dept && "bg-violet-500/10"

                                )}

                              >
                                <div className="flex items-center gap-2">
                                  {Icon && <Icon className="h-4 w-4" />}
                                  <SelectPrimitive.ItemText>{dept}</SelectPrimitive.ItemText>
                                </div>

                              </SelectPrimitive.Item>
                            );
                          })}

                        </SelectContent>

                      </Select>

                    ) : (

                      <Input value={formData.department || domain?.department || ''} readOnly className="bg-muted/50 text-base border-none focus-visible:ring-0" />

                    )}

                  </div>

                </div>

              </div>

              

              <Separator />



              {/* Comment Section */}

              <div className="space-y-2">

                 <div className="flex items-center justify-between mb-2">

                     <label className="text-sm leading-none text-muted-foreground flex items-center gap-2">

                         <FileText className={`h-4 w-4 ${isEditing ? '!text-green-600' : ''}`} />

                         Комментарий

                     </label>

                     <Button 

                       variant="ghost" 

                       size="sm" 

                       className="h-8 gap-2 text-xs"

                       onClick={() => setIsDescriptionOpen(!isDescriptionOpen)}

                     >

                         {isDescriptionOpen ? 'Свернуть' : 'Развернуть'}

                     </Button>

                 </div>

                 

                 {/* Single container with conditional content */}

                 {isEditing && isDescriptionOpen ? (

                   <Textarea

                     value={formData.description}

                     onChange={(e) => handleFieldChange('description', e.target.value)}

                     className="w-full min-h-[100px] bg-muted/30 border-none resize-none"

                     placeholder="Введите комментарий..."

                   />

                 ) : (

                   <div

                     className={cn(

                       "w-full rounded-md border-none bg-muted/30 px-3 py-2 text-sm shadow-sm transition-all duration-200 flex items-center",

                       isDescriptionOpen ? "min-h-[100px] whitespace-pre-wrap items-start" : "min-h-10"

                     )}

                     onClick={() => isEditing && setIsDescriptionOpen(true)}

                     role={isEditing ? "button" : undefined}

                   >

                     {formData.description || domain?.description ? (

                       <span className="text-muted-foreground">

                         {isDescriptionOpen 

                           ? (formData.description || domain?.description)

                           : ((formData.description || domain?.description || '').length > 100 

                               ? `${(formData.description || domain?.description || '').substring(0, 100)}...` 

                               : (formData.description || domain?.description)

                             )

                         }

                       </span>

                     ) : (

                       <span className="text-muted-foreground italic">Комментарий отсутствует</span>

                     )}

                   </div>

                 )}

              </div>



            </div>

          </div>



          {/* Author and Date - moved to bottom as less important info */}

          <div className="flex flex-wrap justify-between items-center gap-6 text-sm text-muted-foreground px-6">

            <div className="flex flex-wrap gap-6">

              <div className="flex items-center gap-2">

                <User className="h-4 w-4" />

                <span>Автор: </span>

                <span>{domain?.owner || "Неизвестен"}</span>

              </div>

              <div className="flex items-center gap-2">

                <CalendarIcon className="h-4 w-4" />

                <span>Дата добавления: </span>

                <span>{new Date().toLocaleDateString()}</span>

              </div>

              <div className="flex items-center gap-2">
                <RotateCcw className="h-4 w-4" />
                <span>Последнее изменение: </span>
                <span>{domain && 'updatedAt' in domain && domain.updatedAt ? new Date(domain.updatedAt as string).toLocaleDateString() : 'Не изменялся'}</span>
              </div>

            </div>

            <Button 
              variant="ghost" 
              className="gap-2 text-muted-foreground hover:text-destructive hover:bg-transparent"
              onClick={() => setShowDeleteDialog(true)}
            >
              <Trash2 className="h-4 w-4" />
              Удалить
            </Button>

          </div>

        </TabsContent>



        {/* 2. DEPARTMENT TAB (GROUPED) - Kept as is */}

        <TabsContent value="department" className="space-y-6">

          <Tabs defaultValue="marketing" className="space-y-4">

            <div className="pl-6">

              <TabsList className="bg-transparent p-0 gap-2 flex-wrap h-auto">

                <TabsTrigger value="marketing" className="gap-1.5 data-[state=active]:bg-blue-500/15 data-[state=active]:text-blue-600 px-3 py-1.5 rounded text-sm font-medium transition-all hover:bg-muted/50">

                  <Megaphone className="h-3.5 w-3.5" /> Маркетинг

                </TabsTrigger>

                <TabsTrigger value="it" className="gap-1.5 data-[state=active]:bg-yellow-500/15 data-[state=active]:text-yellow-600 px-3 py-1.5 rounded text-sm font-medium transition-all hover:bg-muted/50">

                  <Server className="h-3.5 w-3.5" /> IT

                </TabsTrigger>

                <TabsTrigger value="analytics" className="gap-1.5 data-[state=active]:bg-green-500/15 data-[state=active]:text-green-600 px-3 py-1.5 rounded text-sm font-medium transition-all hover:bg-muted/50">

                  <BarChart3 className="h-3.5 w-3.5" /> Аналитика

                </TabsTrigger>

                <TabsTrigger value="partnership" className="gap-1.5 data-[state=active]:bg-amber-500/15 data-[state=active]:text-amber-600 px-3 py-1.5 rounded text-sm font-medium transition-all hover:bg-muted/50">

                  <Users className="h-3.5 w-3.5" /> Партнёрка

                </TabsTrigger>

              </TabsList>

            </div>



            <TabsContent value="marketing" className="space-y-6 mt-2">

              <div className="w-full">

                <div className="p-6 space-y-8">

                  {/* Two columns */}

                  <div className="grid gap-8 md:grid-cols-2">

                    {/* Column 1 */}

                    <div className="space-y-5">

                      <div className="space-y-2">

                        <label className="text-sm leading-none text-muted-foreground flex items-center gap-2">

                          <Tag className={`h-4 w-4 ${isEditing ? '!text-green-600' : ''}`} />

                          Категория

                        </label>

                        <Select value={formData.category} onValueChange={(value) => handleFieldChange('category', value)} disabled={!isEditing}>

                          <SelectTrigger className="bg-muted/50 disabled:opacity-100 disabled:cursor-default">

                            <SelectValue />

                          </SelectTrigger>

                          <SelectContent>

                            {marketingCategories.map((category) => (

                              <SelectPrimitive.Item

                                key={category}

                                value={category}

                                className={cn(

                                  "relative flex w-full cursor-pointer select-none items-center rounded-sm py-1.5 px-2 text-sm outline-none transition-colors",

                                  "focus:bg-violet-500/10",

                                  "data-[disabled]:pointer-events-none data-[disabled]:opacity-50",

                                  formData.category === category && "bg-violet-500/10"

                                )}

                              >

                                <SelectPrimitive.ItemText>{category}</SelectPrimitive.ItemText>

                              </SelectPrimitive.Item>

                            ))}

                          </SelectContent>

                        </Select>

                      </div>



                      <div className="space-y-2">

                        <label className="text-sm leading-none text-muted-foreground flex items-center gap-2">

                          <BarChart3 className={`h-4 w-4 ${isEditing ? '!text-green-600' : ''}`} />

                          Направление

                        </label>

                        <Select value={formData.direction} onValueChange={(value) => handleFieldChange('direction', value)} disabled={!isEditing}>

                          <SelectTrigger className="bg-muted/50 disabled:opacity-100 disabled:cursor-default">

                            <SelectValue />

                          </SelectTrigger>

                          <SelectContent>

                            {marketingDirections.map((direction) => (

                              <SelectPrimitive.Item

                                key={direction}

                                value={direction}

                                className={cn(

                                  "relative flex w-full cursor-pointer select-none items-center rounded-sm py-1.5 px-2 text-sm outline-none transition-colors",

                                  "focus:bg-violet-500/10",

                                  "data-[disabled]:pointer-events-none data-[disabled]:opacity-50",

                                  formData.direction === direction && "bg-violet-500/10"

                                )}

                              >

                                <SelectPrimitive.ItemText>{direction}</SelectPrimitive.ItemText>

                              </SelectPrimitive.Item>

                            ))}

                          </SelectContent>

                        </Select>

                      </div>



                      <div className="space-y-2">

                        <label className="text-sm leading-none text-muted-foreground flex items-center gap-2">

                          <Activity className={`h-4 w-4 ${isEditing ? '!text-green-600' : ''}`} />

                          Целевое действие

                        </label>

                        <Select value={formData.targetAction} onValueChange={(value) => handleFieldChange('targetAction', value)} disabled={!isEditing}>

                          <SelectTrigger className="bg-muted/50 disabled:opacity-100 disabled:cursor-default">

                            <SelectValue />

                          </SelectTrigger>

                          <SelectContent>

                            {targetActions.map((action) => (

                              <SelectPrimitive.Item

                                key={action}

                                value={action}

                                className={cn(

                                  "relative flex w-full cursor-pointer select-none items-center rounded-sm py-1.5 px-2 text-sm outline-none transition-colors",

                                  "focus:bg-violet-500/10",

                                  "data-[disabled]:pointer-events-none data-[disabled]:opacity-50",

                                  formData.targetAction === action && "bg-violet-500/10"

                                )}

                              >

                                <SelectPrimitive.ItemText>{action}</SelectPrimitive.ItemText>

                              </SelectPrimitive.Item>

                            ))}

                          </SelectContent>

                        </Select>

                      </div>

                    </div>



                    {/* Column 2 */}

                    <div className="space-y-5">

                      <div className="space-y-2">

                        <label className="text-sm leading-none text-muted-foreground flex items-center gap-2">

                          <Tag className={`h-4 w-4 ${isEditing ? '!text-green-600' : ''}`} />

                          Бонус

                        </label>

                        <Select value={formData.bonus} onValueChange={(value) => handleFieldChange('bonus', value)} disabled={!isEditing}>

                          <SelectTrigger className="bg-muted/50 disabled:opacity-100 disabled:cursor-default">

                            <SelectValue />

                          </SelectTrigger>

                          <SelectContent>

                            {bonusTypes.map((bonus) => (

                              <SelectPrimitive.Item

                                key={bonus}

                                value={bonus}

                                className={cn(

                                  "relative flex w-full cursor-pointer select-none items-center rounded-sm py-1.5 px-2 text-sm outline-none transition-colors",

                                  "focus:bg-violet-500/10",

                                  "data-[disabled]:pointer-events-none data-[disabled]:opacity-50",

                                  formData.bonus === bonus && "bg-violet-500/10"

                                )}

                              >

                                <SelectPrimitive.ItemText>{bonus}</SelectPrimitive.ItemText>

                              </SelectPrimitive.Item>

                            ))}

                          </SelectContent>

                        </Select>

                      </div>



                      <div className="space-y-2">

                        <label className="text-sm leading-none text-muted-foreground flex items-center gap-2">

                          <AlertCircle className={`h-4 w-4 ${isEditing ? '!text-green-600' : ''}`} />

                          Требует обновления

                        </label>

                        <Select value={formData.needsUpdate} onValueChange={(value) => handleFieldChange('needsUpdate', value)} disabled={!isEditing}>

                          <SelectTrigger className="bg-muted/50 disabled:opacity-100 disabled:cursor-default">

                            <SelectValue />

                          </SelectTrigger>

                          <SelectContent>

                            {needsUpdateOptions.map((option) => (

                              <SelectPrimitive.Item

                                key={option}

                                value={option}

                                className={cn(

                                  "relative flex w-full cursor-pointer select-none items-center rounded-sm py-1.5 px-2 text-sm outline-none transition-colors",

                                  "focus:bg-violet-500/10",

                                  "data-[disabled]:pointer-events-none data-[disabled]:opacity-50",

                                  formData.needsUpdate === option && "bg-violet-500/10"

                                )}

                              >

                                <SelectPrimitive.ItemText>{option}</SelectPrimitive.ItemText>

                              </SelectPrimitive.Item>

                            ))}

                          </SelectContent>

                        </Select>

                      </div>



                      <div className="space-y-2">

                        <label className="text-sm leading-none text-muted-foreground flex items-center gap-2">

                          <FileText className={`h-4 w-4 ${isEditing ? '!text-green-600' : ''}`} />

                          Ссылка на задачу Jira

                        </label>

                        <div className="relative">

                          <Input 

                            value={formData.jiraTask || "Нет"} 

                            onChange={(e) => handleFieldChange('jiraTask', e.target.value)}

                            readOnly={!isEditing}

                            className="bg-muted/50 text-base border-none focus-visible:ring-0 pr-10 truncate" 

                          />

                          {!isEditing && formData.jiraTask && formData.jiraTask !== "Нет" && (

                            <Button

                              variant="ghost"

                              size="icon"

                              className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 hover:bg-transparent hover:text-yellow-400"

                              onClick={(e) => {

                                e.stopPropagation();

                                try {

                                  navigator.clipboard.writeText(formData.jiraTask);

                                  toast.success("Ссылка скопирована");

                                } catch (error) {

                                  toast.error("Не удалось скопировать");

                                }

                              }}

                            >

                              <Copy className="h-4 w-4" />

                            </Button>

                          )}

                        </div>

                      </div>

                    </div>

                  </div>



                  <Separator />



                  {/* Comment Section */}

                  <div className="space-y-2">

                    <div className="flex items-center justify-between mb-2">

                      <label className="text-sm leading-none text-muted-foreground flex items-center gap-2">

                        <FileText className={`h-4 w-4 ${isEditing ? '!text-green-600' : ''}`} />

                        Примечание

                      </label>

                      <Button 

                        variant="ghost" 

                        size="sm" 

                        className="h-8 gap-2 text-xs"

                        onClick={() => setIsMarketingNoteOpen(!isMarketingNoteOpen)}

                      >

                        {isMarketingNoteOpen ? 'Свернуть' : 'Развернуть'}

                        <ChevronsUpDown className={cn("h-3 w-3 transition-transform", isMarketingNoteOpen && "rotate-180")} />

                      </Button>

                    </div>

                    

                    {isEditing && isMarketingNoteOpen ? (

                      <Textarea

                        value={formData.marketingNote}

                        onChange={(e) => handleFieldChange('marketingNote', e.target.value)}

                        className="w-full min-h-[100px] bg-muted/30 border-none resize-none"

                        placeholder="Введите примечание для маркетинга..."

                      />

                    ) : (

                      <div

                        className={cn(

                          "w-full rounded-md border-none bg-muted/30 px-3 py-2 text-sm shadow-sm transition-all duration-200 flex items-center",

                          isMarketingNoteOpen ? "min-h-[100px] whitespace-pre-wrap items-start" : "min-h-10"

                        )}

                        onClick={() => isEditing && setIsMarketingNoteOpen(true)}

                        role={isEditing ? "button" : undefined}

                      >

                        {formData.marketingNote ? (

                          <span className="text-muted-foreground">

                            {isMarketingNoteOpen

                              ? formData.marketingNote 

                              : (formData.marketingNote.length > 100 

                                  ? `${formData.marketingNote.substring(0, 100)}...` 

                                  : formData.marketingNote

                                )

                            }

                          </span>

                        ) : (

                          <span className="text-muted-foreground italic">Примечание отсутствует</span>

                        )}

                      </div>

                    )}

                  </div>

                </div>

              </div>

            </TabsContent>



            <TabsContent value="it" className="space-y-6 mt-2">

              <div className="w-full">

                <div className="p-6 space-y-8">

                  {/* Two columns */}

                  <div className="grid gap-8 md:grid-cols-2">

                    {/* Column 1 */}

                    <div className="space-y-5">

                      <div className="space-y-2">

                        <label className="text-sm leading-none text-muted-foreground flex items-center gap-2">

                          <Server className={`h-4 w-4 ${isEditing ? '!text-green-600' : ''}`} />

                          Хостинг файлов

                        </label>

                        <div className="relative">

                          <Input 

                            value={!isEditing && !formData.fileHosting ? "Не указано" : (formData.fileHosting || "")} 

                            onChange={(e) => handleFieldChange('fileHosting', e.target.value)}

                            readOnly={!isEditing}

                            className="bg-muted/50 text-base border-none focus-visible:ring-0 pr-10 truncate" 

                            placeholder="Не указано"

                          />

                          {!isEditing && formData.fileHosting && (

                            <Button

                              variant="ghost"

                              size="icon"

                              className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 hover:bg-transparent hover:text-yellow-400"

                              onClick={(e) => {

                                e.stopPropagation();

                                try {

                                  navigator.clipboard.writeText(formData.fileHosting);

                                  toast.success("Хостинг скопирован");

                                } catch (error) {

                                  toast.error("Не удалось скопировать");

                                }

                              }}

                            >

                              <Copy className="h-4 w-4" />

                            </Button>

                          )}

                        </div>

                      </div>



                      <div className="space-y-2">

                        <label className="text-sm leading-none text-muted-foreground flex items-center gap-2">

                          <Globe className={`h-4 w-4 ${isEditing ? '!text-green-600' : ''}`} />

                          Регистратор

                        </label>

                        <div className="relative">

                          <Input 

                            value={!isEditing && !formData.registrar ? "Не указано" : (formData.registrar || "")} 

                            onChange={(e) => handleFieldChange('registrar', e.target.value)}

                            readOnly={!isEditing}

                            className="bg-muted/50 text-base border-none focus-visible:ring-0 pr-10 truncate" 

                            placeholder="Не указано"

                          />

                          {!isEditing && formData.registrar && (

                            <Button

                              variant="ghost"

                              size="icon"

                              className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 hover:bg-transparent hover:text-yellow-400"

                              onClick={(e) => {

                                e.stopPropagation();

                                try {

                                  navigator.clipboard.writeText(formData.registrar);

                                  toast.success("Регистратор скопирован");

                                } catch (error) {

                                  toast.error("Не удалось скопировать");

                                }

                              }}

                            >

                              <Copy className="h-4 w-4" />

                            </Button>

                          )}

                        </div>

                      </div>



                      <div className="space-y-2">

                        <label className="text-sm leading-none text-muted-foreground flex items-center gap-2">

                          <Server className={`h-4 w-4 ${isEditing ? '!text-green-600' : ''}`} />

                          NS-записи

                        </label>

                        <div className="relative flex gap-2">

                          <Input 

                            value={formData.nsServers?.[0] || ""} 

                            onChange={(e) => {

                              const newNsServers = [...(formData.nsServers || [])];

                              newNsServers[0] = e.target.value;

                              handleFieldChange('nsServers', newNsServers.filter(ns => ns));

                            }}

                            readOnly={!isEditing}

                            className="bg-muted/50 text-base border-none focus-visible:ring-0 font-mono text-sm flex-1" 

                            placeholder="NS1"

                          />

                          <Input 

                            value={formData.nsServers?.[1] || ""} 

                            onChange={(e) => {

                              const newNsServers = [...(formData.nsServers || [])];

                              newNsServers[1] = e.target.value;

                              handleFieldChange('nsServers', newNsServers.filter(ns => ns));

                            }}

                            readOnly={!isEditing}

                            className="bg-muted/50 text-base border-none focus-visible:ring-0 font-mono text-sm flex-1 pr-10" 

                            placeholder="NS2"

                          />

                          {!isEditing && formData.nsServers && formData.nsServers.length > 0 && (

                            <Button

                              variant="ghost"

                              size="icon"

                              className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 hover:bg-transparent hover:text-yellow-400"

                              onClick={(e) => {

                                e.stopPropagation();

                                try {

                                  const validNs = formData.nsServers.filter(ns => ns && ns.trim());

                                  navigator.clipboard.writeText(validNs.join(" "));

                                  toast.success("NS-записи скопированы");

                                } catch (error) {

                                  toast.error("Не удалось скопировать");

                                }

                              }}

                            >

                              <Copy className="h-4 w-4" />

                            </Button>

                          )}

                        </div>

                      </div>



                      <div className="space-y-2">

                        <label className="text-sm leading-none text-muted-foreground flex items-center gap-2">

                          <AlertCircle className={`h-4 w-4 ${isEditing ? '!text-green-600' : ''}`} />

                          Тех. ограничения

                        </label>

                        <Select value={formData.hasTechIssues || "Нет"} onValueChange={(value) => handleFieldChange('hasTechIssues', value)} disabled={!isEditing}>

                          <SelectTrigger className="bg-muted/50 disabled:opacity-100 disabled:cursor-default">

                            <SelectValue />

                          </SelectTrigger>

                          <SelectContent>

                            {["Нет", "Да"].map((option) => (

                              <SelectPrimitive.Item

                                key={option}

                                value={option}

                                className={cn(

                                  "relative flex w-full cursor-pointer select-none items-center rounded-sm py-1.5 px-2 text-sm outline-none transition-colors",

                                  "focus:bg-violet-500/10",

                                  "data-[disabled]:pointer-events-none data-[disabled]:opacity-50",

                                  formData.hasTechIssues === option && "bg-violet-500/10"

                                )}

                              >

                                <SelectPrimitive.ItemText>{option}</SelectPrimitive.ItemText>

                              </SelectPrimitive.Item>

                            ))}

                          </SelectContent>

                        </Select>

                      </div>

                    </div>



                    {/* Column 2 */}

                    <div className="space-y-5">

                      <div className="space-y-2">

                        <label className="text-sm leading-none text-muted-foreground flex items-center gap-2">

                          <FileText className={`h-4 w-4 ${isEditing ? '!text-green-600' : ''}`} />

                          Ссылка на Jira

                        </label>

                        <div className="relative">

                          <Input 

                            value={!isEditing && !formData.jiraTaskIT ? "Не указано" : (formData.jiraTaskIT || "")} 

                            onChange={(e) => handleFieldChange('jiraTaskIT', e.target.value)}

                            readOnly={!isEditing}

                            className="bg-muted/50 text-base border-none focus-visible:ring-0 pr-10 truncate" 

                            placeholder="Не указано"

                          />

                          {!isEditing && formData.jiraTaskIT && (

                            <Button

                              variant="ghost"

                              size="icon"

                              className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 hover:bg-transparent hover:text-yellow-400"

                              onClick={(e) => {

                                e.stopPropagation();

                                try {

                                  navigator.clipboard.writeText(formData.jiraTaskIT);

                                  toast.success("Ссылка скопирована");

                                } catch (error) {

                                  toast.error("Не удалось скопировать");

                                }

                              }}

                            >

                              <Copy className="h-4 w-4" />

                            </Button>

                          )}

                        </div>

                      </div>



                      <div className="space-y-2">

                        <label className="text-sm leading-none text-muted-foreground flex items-center gap-2">

                          <CalendarIcon className={`h-4 w-4 ${isEditing ? '!text-green-600' : ''}`} />

                          Дата покупки

                        </label>

                        <Popover>

                          <PopoverTrigger asChild>

                            <Button

                              variant="outline"

                              disabled={!isEditing}

                              className={cn(

                                "w-full justify-start text-left font-normal bg-muted/50 border-none hover:bg-muted/70 disabled:opacity-100 disabled:cursor-default",

                                !formData.purchaseDate && "text-muted-foreground"

                              )}

                            >

                              <CalendarIcon className="mr-2 h-4 w-4" />

                              {formData.purchaseDate ? format(parseISO(formData.purchaseDate), "dd.MM.yyyy") : <span>Не указано</span>}

                            </Button>

                          </PopoverTrigger>

                          <PopoverContent className="w-auto p-0" align="start">

                            <Calendar

                              mode="single"

                              selected={formData.purchaseDate ? parseISO(formData.purchaseDate) : undefined}

                              onSelect={(date) => {

                                handleFieldChange('purchaseDate', date ? date.toISOString() : '');

                              }}

                              initialFocus

                            />

                          </PopoverContent>

                        </Popover>

                      </div>



                      <div className="space-y-2">

                        <label className="text-sm leading-none text-muted-foreground flex items-center gap-2">

                          <CalendarIcon className={`h-4 w-4 ${isEditing ? '!text-green-600' : ''}`} />

                          Дата продления

                        </label>

                        <Popover>

                          <PopoverTrigger asChild>

                            <Button

                              variant="outline"

                              disabled={!isEditing}

                              className={cn(

                                "w-full justify-start text-left font-normal bg-muted/50 border-none hover:bg-muted/70 disabled:opacity-100 disabled:cursor-default",

                                !formData.renewalDate && "text-muted-foreground"

                              )}

                            >

                              <CalendarIcon className="mr-2 h-4 w-4" />

                              {formData.renewalDate ? format(parseISO(formData.renewalDate), "dd.MM.yyyy") : <span>Не указано</span>}

                            </Button>

                          </PopoverTrigger>

                          <PopoverContent className="w-auto p-0" align="start">

                            <Calendar

                              mode="single"

                              selected={formData.renewalDate ? parseISO(formData.renewalDate) : undefined}

                              onSelect={(date) => {

                                handleFieldChange('renewalDate', date ? date.toISOString() : '');

                              }}

                              initialFocus

                            />

                          </PopoverContent>

                        </Popover>

                      </div>



                      <div className="space-y-2">

                        <label className="text-sm leading-none text-muted-foreground flex items-center gap-2">

                          <Code2 className={`h-4 w-4 ${isEditing ? '!text-green-600' : ''}`} />

                          Метод тестирования

                        </label>

                        <Select value={formData.testMethod} onValueChange={(value) => handleFieldChange('testMethod', value)} disabled={!isEditing}>

                          <SelectTrigger className="bg-muted/50 disabled:opacity-100 disabled:cursor-default">

                            <SelectValue />

                          </SelectTrigger>

                          <SelectContent>

                            {["Не известно", "Мануально + VPN", "Авто проксирование", "Авто + мануальное"].map((option) => (

                              <SelectPrimitive.Item

                                key={option}

                                value={option}

                                className={cn(

                                  "relative flex w-full cursor-pointer select-none items-center rounded-sm py-1.5 px-2 text-sm outline-none transition-colors",

                                  "focus:bg-violet-500/10",

                                  "data-[disabled]:pointer-events-none data-[disabled]:opacity-50",

                                  formData.testMethod === option && "bg-violet-500/10"

                                )}

                              >

                                <SelectPrimitive.ItemText>{option}</SelectPrimitive.ItemText>

                              </SelectPrimitive.Item>

                            ))}

                          </SelectContent>

                        </Select>

                      </div>

                    </div>

                  </div>



                  <Separator />



                  {/* Comment Section */}

                  <div className="space-y-2">

                    <div className="flex items-center justify-between mb-2">

                      <label className="text-sm leading-none text-muted-foreground flex items-center gap-2">

                        <FileText className={`h-4 w-4 ${isEditing ? '!text-green-600' : ''}`} />

                        Примечание

                      </label>

                      <Button 

                        variant="ghost" 

                        size="sm" 

                        className="h-8 gap-2 text-xs"

                        onClick={() => setIsAnalyticsNoteOpen(!isAnalyticsNoteOpen)}

                      >

                        {isAnalyticsNoteOpen ? 'Свернуть' : 'Развернуть'}

                        <ChevronsUpDown className={cn("h-3 w-3 transition-transform", isAnalyticsNoteOpen && "rotate-180")} />

                      </Button>

                    </div>

                    

                    <div className={cn(

                      "w-full rounded-md border-none bg-muted/30 px-3 py-2 text-sm shadow-sm transition-all duration-200 flex items-center",

                      isAnalyticsNoteOpen ? "min-h-[100px] whitespace-pre-wrap items-start" : "min-h-10"

                    )}>

                      {domain?.description ? (

                        <span className="text-muted-foreground">

                          {isAnalyticsNoteOpen 

                            ? domain?.description 

                            : (domain?.description?.length > 100 

                                ? `${domain?.description?.substring(0, 100)}...` 

                                : domain?.description

                              )

                          }

                        </span>

                      ) : (

                        <span className="text-muted-foreground italic">Примечание отсутствует</span>

                      )}

                    </div>

                  </div>

                </div>

              </div>

            </TabsContent>



            <TabsContent value="analytics" className="space-y-6 mt-2">

              <div className="w-full">

                <div className="p-6 space-y-8">

                  {/* Two columns */}

                  <div className="grid gap-8 md:grid-cols-2">

                    {/* Column 1 */}

                    <div className="space-y-5">

                      <div className="space-y-2">

                        <label className="text-sm leading-none text-muted-foreground flex items-center gap-2">

                          <BarChart3 className={`h-4 w-4 ${isEditing ? '!text-green-600' : ''}`} />

                          Номер счетчика GA

                        </label>

                        <div className="relative">

                          <Input 

                            value={!isEditing && !formData.gaId ? "Не указано" : (formData.gaId || "")} 

                            onChange={(e) => handleFieldChange('gaId', e.target.value)}

                            readOnly={!isEditing}

                            className="bg-muted/50 text-base border-none focus-visible:ring-0 pr-10 truncate" 

                            placeholder="Не указано"

                          />

                          {!isEditing && formData.gaId && (

                            <Button

                              variant="ghost"

                              size="icon"

                              className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 hover:bg-transparent hover:text-yellow-400"

                              onClick={(e) => {

                                e.stopPropagation();

                                try {

                                  navigator.clipboard.writeText(formData.gaId);

                                  toast.success("GA ID скопирован");

                                } catch (error) {

                                  toast.error("Не удалось скопировать");

                                }

                              }}

                            >

                              <Copy className="h-4 w-4" />

                            </Button>

                          )}

                        </div>

                      </div>

                    </div>



                    {/* Column 2 */}

                    <div className="space-y-5">

                      <div className="space-y-2">

                        <label className="text-sm leading-none text-muted-foreground flex items-center gap-2">

                          <Code2 className={`h-4 w-4 ${isEditing ? '!text-green-600' : ''}`} />

                          Номер счетчика GTM

                        </label>

                        <div className="relative">

                          <Input 

                            value={!isEditing && !formData.gtmId ? "Не указано" : (formData.gtmId || "")} 

                            onChange={(e) => handleFieldChange('gtmId', e.target.value)}

                            readOnly={!isEditing}

                            className="bg-muted/50 text-base border-none focus-visible:ring-0 pr-10 truncate" 

                            placeholder="Не указано"

                          />

                          {!isEditing && formData.gtmId && (

                            <Button

                              variant="ghost"

                              size="icon"

                              className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 hover:bg-transparent hover:text-yellow-400"

                              onClick={(e) => {

                                e.stopPropagation();

                                try {

                                  navigator.clipboard.writeText(formData.gtmId);

                                  toast.success("GTM ID скопирован");

                                } catch (error) {

                                  toast.error("Не удалось скопировать");

                                }

                              }}

                            >

                              <Copy className="h-4 w-4" />

                            </Button>

                          )}

                        </div>

                      </div>

                    </div>

                  </div>



                  <Separator />



                  {/* Comment Section */}

                  <div className="space-y-2">

                    <div className="flex items-center justify-between mb-2">

                      <label className="text-sm leading-none text-muted-foreground flex items-center gap-2">

                        <FileText className={`h-4 w-4 ${isEditing ? '!text-green-600' : ''}`} />

                        Примечание

                      </label>

                      <Button 

                        variant="ghost" 

                        size="sm" 

                        className="h-8 gap-2 text-xs"

                        onClick={() => setIsAnalyticsNoteOpen(!isAnalyticsNoteOpen)}

                      >

                        {isAnalyticsNoteOpen ? 'Свернуть' : 'Развернуть'}

                        <ChevronsUpDown className={cn("h-3 w-3 transition-transform", isAnalyticsNoteOpen && "rotate-180")} />

                      </Button>

                    </div>

                    

                    <div className={cn(

                      "w-full rounded-md border-none bg-muted/30 px-3 py-2 text-sm shadow-sm transition-all duration-200 flex items-center",

                      isAnalyticsNoteOpen ? "min-h-[100px] whitespace-pre-wrap items-start" : "min-h-10"

                    )}>

                      {domain?.description ? (

                        <span className="text-muted-foreground">

                          {isAnalyticsNoteOpen 

                            ? domain?.description 

                            : (domain?.description?.length > 100 

                                ? `${domain?.description?.substring(0, 100)}...` 

                                : domain?.description

                              )

                          }

                        </span>

                      ) : (

                        <span className="text-muted-foreground italic">Примечание отсутствует</span>

                      )}

                    </div>

                  </div>

                </div>

              </div>

            </TabsContent>



            <TabsContent value="partnership" className="space-y-6 mt-2">

              <div className="w-full">

                <div className="p-6 space-y-8">

                  {/* Two columns */}

                  <div className="grid gap-8 md:grid-cols-2">

                    {/* Column 1 */}

                    <div className="space-y-5">

                      <div className="space-y-2">

                        <label className="text-sm leading-none text-muted-foreground flex items-center gap-2">

                          <Users className={`h-4 w-4 ${isEditing ? '!text-green-600' : ''}`} />

                          Наличие в ПП

                        </label>

                        <Select value={formData.isInProgramStatus} onValueChange={(value) => handleFieldChange('isInProgramStatus', value)} disabled={!isEditing}>

                          <SelectTrigger className="bg-muted/50 disabled:opacity-100 disabled:cursor-default">

                            <SelectValue />

                          </SelectTrigger>

                          <SelectContent>

                            {["Не известно", "Да", "Нет"].map((option) => (

                              <SelectPrimitive.Item

                                key={option}

                                value={option}

                                className={cn(

                                  "relative flex w-full cursor-pointer select-none items-center rounded-sm py-1.5 px-2 text-sm outline-none transition-colors",

                                  "focus:bg-violet-500/10",

                                  "data-[disabled]:pointer-events-none data-[disabled]:opacity-50",

                                  formData.isInProgramStatus === option && "bg-violet-500/10"

                                )}

                              >

                                <SelectPrimitive.ItemText>{option}</SelectPrimitive.ItemText>

                              </SelectPrimitive.Item>

                            ))}

                          </SelectContent>

                        </Select>

                      </div>



                      <div className="space-y-2">

                        <label className="text-sm leading-none text-muted-foreground flex items-center gap-2">

                          <FileText className={`h-4 w-4 ${isEditing ? '!text-green-600' : ''}`} />

                          Ссылка в ПП

                        </label>

                        <Input 

                          value={!isEditing && !formData.programLink ? "Не указано" : (formData.programLink || "")} 

                          onChange={(e) => handleFieldChange('programLink', e.target.value)}

                          readOnly={!isEditing}

                          className="bg-muted/50 text-base border-none focus-visible:ring-0" 

                          placeholder="Не указано"

                        />

                      </div>

                    </div>



                    {/* Column 2 */}

                    <div className="space-y-5">

                      <div className="space-y-2">

                        <label className="text-sm leading-none text-muted-foreground flex items-center gap-2">

                          <Tag className={`h-4 w-4 ${isEditing ? '!text-green-600' : ''}`} />

                          Имя компании

                        </label>

                        <Input 

                          value={!isEditing && !formData.companyName ? "Не указано" : (formData.companyName || "")} 

                          onChange={(e) => handleFieldChange('companyName', e.target.value)}

                          readOnly={!isEditing}

                          className="bg-muted/50 text-base border-none focus-visible:ring-0" 

                          placeholder="Не указано"

                        />

                      </div>



                      <div className="space-y-2">

                        <label className="text-sm leading-none text-muted-foreground flex items-center gap-2">

                          <Activity className={`h-4 w-4 ${isEditing ? '!text-green-600' : ''}`} />

                          Статус в ПП

                        </label>

                        <Select value={formData.programStatus} onValueChange={(value) => handleFieldChange('programStatus', value)} disabled={!isEditing}>

                          <SelectTrigger className="bg-muted/50 disabled:opacity-100 disabled:cursor-default">

                            <SelectValue />

                          </SelectTrigger>

                          <SelectContent>

                            {["Не известно", "Активен", "Не активен", "Запасной"].map((option) => (

                              <SelectPrimitive.Item

                                key={option}

                                value={option}

                                className={cn(

                                  "relative flex w-full cursor-pointer select-none items-center rounded-sm py-1.5 px-2 text-sm outline-none transition-colors",

                                  "focus:bg-violet-500/10",

                                  "data-[disabled]:pointer-events-none data-[disabled]:opacity-50",

                                  formData.programStatus === option && "bg-violet-500/10"

                                )}

                              >

                                <SelectPrimitive.ItemText>{option}</SelectPrimitive.ItemText>

                              </SelectPrimitive.Item>

                            ))}

                          </SelectContent>

                        </Select>

                      </div>

                    </div>

                  </div>



                  <Separator />



                  {/* Comment Section */}

                  <div className="space-y-2">

                    <div className="flex items-center justify-between mb-2">

                      <label className="text-sm leading-none text-muted-foreground flex items-center gap-2">

                        <FileText className={`h-4 w-4 ${isEditing ? '!text-green-600' : ''}`} />

                        Примечание

                      </label>

                      <Button 

                        variant="ghost" 

                        size="sm" 

                        className="h-8 gap-2 text-xs"

                        onClick={() => setIsPartnershipNoteOpen(!isPartnershipNoteOpen)}

                      >

                        {isPartnershipNoteOpen ? 'Свернуть' : 'Развернуть'}

                        <ChevronsUpDown className={cn("h-3 w-3 transition-transform", isPartnershipNoteOpen && "rotate-180")} />

                      </Button>

                    </div>

                    

                    <div className={cn(

                      "w-full rounded-md border-none bg-muted/30 px-3 py-2 text-sm shadow-sm transition-all duration-200 flex items-center",

                      isPartnershipNoteOpen ? "min-h-[100px] whitespace-pre-wrap items-start" : "min-h-10"

                    )}>

                      {domain?.description ? (

                        <span className="text-muted-foreground">

                          {isPartnershipNoteOpen 

                            ? domain?.description 

                            : (domain?.description?.length > 100 

                                ? `${domain?.description?.substring(0, 100)}...` 

                                : domain?.description

                              )

                          }

                        </span>

                      ) : (

                        <span className="text-muted-foreground italic">Примечание отсутствует</span>

                      )}

                    </div>

                  </div>

                </div>

              </div>

            </TabsContent>

          </Tabs>

        </TabsContent>



        {/* 3. INTEGRATIONS TAB */}

        <TabsContent value="integrations" className="space-y-6">

          <div className="w-full">

            <div className="p-6 space-y-8">

              {/* Two columns */}

              <div className="grid gap-8 md:grid-cols-2">

                {/* Column 1 */}

                <div className="space-y-5">

                  <div className="space-y-2">

                    <label className="text-sm leading-none text-muted-foreground flex items-center gap-2">

                      <Layers className={`h-4 w-4 ${isEditing ? '!text-green-600' : ''}`} />

                      OneSignal App ID

                    </label>

                    <Input 

                      value={!isEditing && !formData.oneSignalId ? "Не указано" : (formData.oneSignalId || "")} 

                      onChange={(e) => handleFieldChange('oneSignalId', e.target.value)}

                      readOnly={!isEditing}

                      className="bg-muted/50 text-base border-none focus-visible:ring-0" 

                      placeholder="Не указано"

                    />

                  </div>

                </div>



                {/* Column 2 */}

                <div className="space-y-5">

                  <div className="space-y-2">

                    <label className="text-sm leading-none text-muted-foreground flex items-center gap-2">

                      <Globe className={`h-4 w-4 ${isEditing ? '!text-green-600' : ''}`} />

                      CloudFlare аккаунт

                    </label>

                    <Input 

                      value={!isEditing && !formData.cloudflareAccount ? "Не указано" : (formData.cloudflareAccount || "")} 

                      onChange={(e) => handleFieldChange('cloudflareAccount', e.target.value)}

                      readOnly={!isEditing}

                      className="bg-muted/50 text-base border-none focus-visible:ring-0" 

                      placeholder="Не указано"

                    />

                  </div>

                </div>

              </div>



              <Separator />



              {/* Comment Section */}

              <div className="space-y-2">

                <div className="flex items-center justify-between mb-2">

                  <label className="text-sm leading-none text-muted-foreground flex items-center gap-2">

                    <FileText className={`h-4 w-4 ${isEditing ? '!text-green-600' : ''}`} />

                    Примечание

                  </label>

                  <Button 

                    variant="ghost" 

                    size="sm" 

                    className="h-8 gap-2 text-xs"

                    onClick={() => setIsIntegrationsNoteOpen(!isIntegrationsNoteOpen)}

                  >

                    {isIntegrationsNoteOpen ? 'Свернуть' : 'Развернуть'}

                    <ChevronsUpDown className={cn("h-3 w-3 transition-transform", isIntegrationsNoteOpen && "rotate-180")} />

                  </Button>

                </div>

                

                <div className={cn(

                  "w-full rounded-md border-none bg-muted/30 px-3 py-2 text-sm shadow-sm transition-all duration-200 flex items-center",

                  isIntegrationsNoteOpen ? "min-h-[100px] whitespace-pre-wrap items-start" : "min-h-10"

                )}>

                  {domain?.description ? (

                    <span className="text-muted-foreground">

                      {isIntegrationsNoteOpen 

                        ? domain?.description 

                        : (domain?.description?.length > 100 

                            ? `${domain?.description?.substring(0, 100)}...` 

                            : domain?.description

                          )

                      }

                    </span>

                  ) : (

                    <span className="text-muted-foreground italic">Примечание отсутствует</span>

                  )}

                </div>

              </div>

            </div>

          </div>

        </TabsContent>

      </Tabs>

      {/* Dialog подтверждения удаления */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              Подтверждение удаления
            </DialogTitle>
            <DialogDescription className="pt-4">
              Вы уверены, что хотите удалить домен <span className="font-semibold text-foreground">{formData.name || domain?.name}</span>?
              <br />
              <br />
              Это действие нельзя будет отменить.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
              className="gap-2"
            >
              Нет, еще подумаю
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                // Логика удаления домена
                toast.success("Домен удален", {
                  description: `${formData.name || domain?.name} был успешно удален`,
                });
                setShowDeleteDialog(false);
                // Переход на страницу со списком доменов
                navigate('/domains');
              }}
              className="gap-2"
            >
              <Trash2 className="h-4 w-4" />
              Да, удаляю
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>

  );

}



function DetailRow({ label, value }: { label: string, value: React.ReactNode }) {

  return (

    <div className="grid grid-cols-[1fr_1.5fr] items-center py-4 px-6 gap-4 hover:bg-muted/30 transition-colors">

      <div className="text-sm text-muted-foreground font-medium">{label}</div>

      <div className="text-sm font-medium text-foreground flex justify-end md:justify-start">{value}</div>

    </div>

  );

}



function InfoRow({ 

  icon: Icon, 

  label, 

  value, 

  copyable = false,

  isLink = false

}: { 

  icon?: any, 

  label: string, 

  value: React.ReactNode, 

  copyable?: boolean,

  isLink?: boolean 

}) {

  const copyToClipboard = (text: string) => {

    navigator.clipboard.writeText(text);

    toast.success("Скопировано");

  };



  return (

    <div className="flex items-center justify-between py-1">

      <div className="flex items-center gap-2 text-sm text-muted-foreground">

        {Icon && <Icon className="h-4 w-4" />}

        <span>{label}</span>

      </div>

      <div className="flex items-center gap-2 font-medium text-sm text-right">

        {isLink && typeof value === 'string' ? (

           <a href={value.startsWith('http') ? value : `https://${value}`} target="_blank" rel="noreferrer" className="text-primary hover:underline flex items-center gap-1">

             {value} <ExternalLink className="h-3 w-3" />

           </a>

        ) : (

           <span>{value}</span>

        )}

        {copyable && typeof value === "string" && (

          <Button

            variant="ghost"

            size="icon"

            className="h-6 w-6"

            onClick={() => copyToClipboard(value)}

          >

            <Copy className="h-3 w-3" />

          </Button>

        )}

      </div>

    </div>

  );

}



function ReadOnlyGeoView({ 

  selected,

  limit = 10 

}: { 

  selected: string[];

  limit?: number;

}) {

  const visible = selected.slice(0, limit);

  const hidden = selected.slice(limit);

  const hasHidden = hidden.length > 0;



  return (

    <div className="space-y-2">

      {/* Выбранные страны с цветами */}

      <div className="flex flex-wrap items-center gap-1 min-h-10 py-2 px-3 rounded-md border-none bg-muted/50">

        {selected.length > 0 ? (

          <>

            {visible.map((val) => {

              const color = getGeoColor(val);

              return (

                <Badge

                  key={val}

                  variant="secondary"

                  style={{ backgroundColor: `${color}20`, color: color }}

                  className="border-0 font-mono text-xs"

                >

                  {val}

                </Badge>

              );

            })}

            {hasHidden && (

              <Popover>

                <PopoverTrigger asChild>

                  <div className="border border-border/50 font-mono text-xs px-2 py-1 rounded-md cursor-pointer">

                    +{hidden.length}

                  </div>

                </PopoverTrigger>

                <PopoverContent className="w-64 p-2">

                  <div className="flex flex-wrap gap-1">

                    {hidden.map((val) => {

                      const color = getGeoColor(val);

                      return (

                        <Badge

                          key={val}

                          variant="secondary"

                          style={{ backgroundColor: `${color}20`, color: color }}

                          className="border-0 font-mono text-xs"

                        >

                          {val}

                        </Badge>

                      );

                    })}

                  </div>

                </PopoverContent>

              </Popover>

            )}

          </>

        ) : (

          <span className="text-muted-foreground/60 text-sm italic">Не выбрано</span>

        )}

      </div>

    </div>

  );

}

