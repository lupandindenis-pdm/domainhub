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

import { cn } from "@/lib/utils";

import { projects, departments, marketingCategories, departmentConfig, bonusTypes } from "@/data/mockDomains";
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

  Tag

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

  

  const domain = mockDomains.find((d) => d.id === id);

  

  const [version, setVersion] = useState<'v1' | 'v2'>('v2');

  const [isDescriptionOpen, setIsDescriptionOpen] = useState(false);

  const [isMarketingNoteOpen, setIsMarketingNoteOpen] = useState(false);

  const [isItNoteOpen, setIsItNoteOpen] = useState(false);

  const [isAnalyticsNoteOpen, setIsAnalyticsNoteOpen] = useState(false);

  const [isPartnershipNoteOpen, setIsPartnershipNoteOpen] = useState(false);

  const [isIntegrationsNoteOpen, setIsIntegrationsNoteOpen] = useState(false);

  const [isEditing, setIsEditing] = useState(false);

  // Normalize category and bonus values - if not in list, use default
  const normalizeValue = (value: string, list: string[]) => {
    if (!value) return list[0] || '';
    return list.includes(value) ? value : list[0] || '';
  };

  // Ensure category and bonus have default values when entering edit mode
  const ensureDefaults = () => {
    setFormData(prev => ({
      ...prev,
      category: normalizeValue(prev.category, marketingCategories),
      bonus: normalizeValue(prev.bonus, bonusTypes)
    }));
  };

  const [domainError, setDomainError] = useState<string>('');

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  

  // Form data state

  const [formData, setFormData] = useState({

    name: domain?.name || '',

    type: domain?.type || '',

    status: domain?.status || '',

    geo: domain?.geo || [],

    blockedGeo: domain?.blockedGeo || [],

    department: domain?.department || '',

    project: domain?.project || '',

    category: normalizeValue(domain?.category || '', marketingCategories),

    direction: domain?.direction || '',

    targetAction: domain?.targetAction || '',

    bonus: normalizeValue(domain?.bonus || '', bonusTypes),

    needsUpdate: domain?.needsUpdate || false,

    jiraTask: domain?.jiraTask || '',

    fileHosting: domain?.fileHosting || '',

    registrar: domain?.registrar || '',

    nsServers: domain?.nsServers || [],

    techIssues: domain?.techIssues || [],

    testMethod: domain?.testMethod || '',

    gaId: domain?.gaId || '',

    gtmId: domain?.gtmId || '',

    isInProgram: domain?.isInProgram || false,

    programLink: domain?.programLink || '',

    companyName: domain?.companyName || '',

    programStatus: domain?.programStatus || '',

    oneSignalId: domain?.oneSignalId || '',

    cloudflareAccount: domain?.cloudflareAccount || '',

    description: domain?.description || '',

    marketingNote: '',

    itNote: '',

    analyticsNote: '',

    partnershipNote: '',

    integrationsNote: ''

  });

  

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

      toast.error('Исправьте ошибки перед сохранением');

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

      direction: domain?.direction || '',

      targetAction: domain?.targetAction || '',

      bonus: normalizeValue(domain?.bonus || '', bonusTypes),

      needsUpdate: domain?.needsUpdate || false,

      jiraTask: domain?.jiraTask || '',

      fileHosting: domain?.fileHosting || '',

      registrar: domain?.registrar || '',

      nsServers: domain?.nsServers || [],

      techIssues: domain?.techIssues || [],

      testMethod: domain?.testMethod || '',

      gaId: domain?.gaId || '',

      gtmId: domain?.gtmId || '',

      isInProgram: domain?.isInProgram || false,

      programLink: domain?.programLink || '',

      companyName: domain?.companyName || '',

      programStatus: domain?.programStatus || '',

      oneSignalId: domain?.oneSignalId || '',

      cloudflareAccount: domain?.cloudflareAccount || '',

      description: domain?.description || '',

      marketingNote: '',

      itNote: '',

      analyticsNote: '',

      partnershipNote: '',

      integrationsNote: ''

    });

    setIsEditing(false);

  };



  // Load edited data from localStorage or reset to domain data

  useEffect(() => {

    if (!id || !domain) return;

    

    try {

      const savedDomains = localStorage.getItem('editedDomains');

      if (savedDomains) {

        const editedDomains = JSON.parse(savedDomains);

        if (editedDomains[id]) {

          setFormData(editedDomains[id]);

          return;

        }

      }

      

      // If no saved data, initialize with domain data

      setFormData({

        name: domain.name || '',

        type: domain.type || '',

        status: domain.status || '',

        geo: domain.geo || [],

        blockedGeo: domain.blockedGeo || [],

        department: domain.department || '',

        project: domain.project || '',

        category: normalizeValue(domain.category || '', marketingCategories),

        direction: domain.direction || '',

        targetAction: domain.targetAction || '',

        bonus: normalizeValue(domain.bonus || '', bonusTypes),

        needsUpdate: domain.needsUpdate || false,

        jiraTask: domain.jiraTask || '',

        fileHosting: domain.fileHosting || '',

        registrar: domain.registrar || '',

        nsServers: domain.nsServers || [],

        techIssues: domain.techIssues || [],

        testMethod: domain.testMethod || '',

        gaId: domain.gaId || '',

        gtmId: domain.gtmId || '',

        isInProgram: domain.isInProgram || false,

        programLink: domain.programLink || '',

        companyName: domain.companyName || '',

        programStatus: domain.programStatus || '',

        oneSignalId: domain.oneSignalId || '',

        cloudflareAccount: domain.cloudflareAccount || '',

        description: domain.description || '',

        marketingNote: '',

        itNote: '',

        analyticsNote: '',

        partnershipNote: '',

        integrationsNote: ''

      });

    } catch (error) {

      console.error('Failed to load edited data:', error);

    }

  }, [id, domain]);



  if (!domain) {

    return (

      <div className="flex flex-col items-center justify-center py-12">

        <p className="text-lg font-medium">Домен не найден</p>

        <Button variant="link" onClick={() => navigate("/domains")}>

          Вернуться к списку

        </Button>

      </div>

    );

  }



  const daysLeft = differenceInDays(parseISO(domain.expirationDate), new Date());



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



  const statusColorClass = statusColors[formData.status || domain.status] || "bg-muted/50";

  const typeColorClass = typeColors[formData.type || domain.type] || "bg-muted/50";



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

                        contentEditable

                        suppressContentEditableWarning

                        onInput={(e) => {

                          const text = e.currentTarget.textContent || '';

                          handleFieldChange('name', text);

                        }}

                        onBlur={(e) => {

                          e.currentTarget.textContent = formData.name;

                        }}

                        className="text-2xl font-bold font-mono tracking-tight bg-transparent outline-none px-2 w-full transition-colors break-all text-green-400"

                        style={{ textWrap: 'balance' }}

                      >

                        {formData.name}

                      </div>

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

                          navigator.clipboard.writeText(formData.name || domain.name);

                          toast.success("Домен скопирован в буфер обмена");

                        } catch (error) {

                          toast.error("Ошибка копирования");

                        }

                      }}

                      onDoubleClick={() => {

                        window.open(`https://${formData.name || domain.name}`, "_blank");

                      }}

                    >

                      {formData.name || domain.name}

                    </div>

                  )}

                </div>

              </div>

            </div>

          </div>

          <div className="flex items-center gap-2 pl-14 mt-2">

            {domain.needsUpdate && (

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

                      projectId: domain.project,

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

              <Button onClick={() => { ensureDefaults(); setIsEditing(true); }} className="gap-2 w-[144px]">

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

      <Tabs defaultValue="general" className="space-y-6 mt-12">

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

                      <Tag className="h-4 w-4" />

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

                        {DOMAIN_TYPE_LABELS[formData.type || domain.type]}

                      </div>

                    )}

                  </div>



                  <div className="space-y-2">

                    <label className="text-sm leading-none text-muted-foreground flex items-center gap-2">

                      <Globe className="h-4 w-4" />

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

                      <BarChart3 className="h-4 w-4" />

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

                        value={formData.project || domain.project} 

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

                      <Activity className="h-4 w-4" />

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

                           {DOMAIN_STATUS_LABELS[formData.status || domain.status]}

                        </span>

                      </div>

                    )}

                  </div>



                  <div className="space-y-2">

                    <label className="text-sm leading-none text-muted-foreground flex items-center gap-2">

                      <Ban className="h-4 w-4" />

                      GEO (блокировка)

                    </label>

                    {isEditing ? (

                      <GeoMultiSelector

                        selected={formData.blockedGeo || []}

                        onChange={(selected) => handleFieldChange('blockedGeo', selected)}

                      />

                    ) : (

                      <ReadOnlyGeoView 

                        selected={formData.blockedGeo || domain.blockedGeo || []} 

                      />

                    )}

                  </div>



                  <div className="space-y-2">

                    <label className="text-sm leading-none text-muted-foreground flex items-center gap-2">

                      <Users className="h-4 w-4" />

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

                      <Input value={formData.department || domain.department} readOnly className="bg-muted/50 text-base border-none focus-visible:ring-0" />

                    )}

                  </div>

                </div>

              </div>

              

              <Separator />



              {/* Comment Section */}

              <div className="space-y-2">

                 <div className="flex items-center justify-between mb-2">

                     <label className="text-sm leading-none text-muted-foreground flex items-center gap-2">

                         <FileText className="h-4 w-4" />

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

                     {formData.description || domain.description ? (

                       <span className="text-muted-foreground">

                         {isDescriptionOpen 

                           ? (formData.description || domain.description)

                           : ((formData.description || domain.description).length > 100 

                               ? `${(formData.description || domain.description).substring(0, 100)}...` 

                               : (formData.description || domain.description)

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

          <div className="flex flex-wrap justify-between gap-6 text-sm text-muted-foreground px-6">

            <div className="flex flex-wrap gap-6">

              <div className="flex items-center gap-2">

                <User className="h-4 w-4" />

                <span>Автор: </span>

                <span>{domain.owner || "Неизвестен"}</span>

              </div>

              <div className="flex items-center gap-2">

                <CalendarIcon className="h-4 w-4" />

                <span>Дата добавления: </span>

                <span>{new Date().toLocaleDateString()}</span>

              </div>

            </div>

            <div className="flex items-center gap-2">

              <RotateCcw className="h-4 w-4" />

              <span>Последнее изменение: </span>

              <span>{formData.updatedAt ? new Date(formData.updatedAt).toLocaleDateString() : 'Не изменялся'}</span>

            </div>

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

                          <Tag className="h-4 w-4" />

                          Категория

                        </label>

                        <Select value={formData.category} onValueChange={(value) => handleFieldChange('category', value)} disabled={!isEditing}>

                          <SelectTrigger className="bg-muted/50">

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

                          <BarChart3 className="h-4 w-4" />

                          Направление

                        </label>

                        <Input 

                          value={formData.direction || "Нет"} 

                          onChange={(e) => handleFieldChange('direction', e.target.value)}

                          readOnly={!isEditing}

                          className="bg-muted/50 text-base border-none focus-visible:ring-0" 

                        />

                      </div>



                      <div className="space-y-2">

                        <label className="text-sm leading-none text-muted-foreground flex items-center gap-2">

                          <Activity className="h-4 w-4" />

                          Целевое действие

                        </label>

                        <Input 

                          value={formData.targetAction || "Нет"} 

                          onChange={(e) => handleFieldChange('targetAction', e.target.value)}

                          readOnly={!isEditing}

                          className="bg-muted/50 text-base border-none focus-visible:ring-0" 

                        />

                      </div>

                    </div>



                    {/* Column 2 */}

                    <div className="space-y-5">

                      <div className="space-y-2">

                        <label className="text-sm leading-none text-muted-foreground flex items-center gap-2">

                          <Tag className="h-4 w-4" />

                          Бонус

                        </label>

                        <Select value={formData.bonus} onValueChange={(value) => handleFieldChange('bonus', value)} disabled={!isEditing}>

                          <SelectTrigger className="bg-muted/50">

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

                          <AlertCircle className="h-4 w-4" />

                          Требует обновления

                        </label>

                        {isEditing ? (

                          <div className="flex items-center h-10 px-3 rounded-md bg-muted/50">

                            <Switch 

                              checked={formData.needsUpdate}

                              onCheckedChange={(checked) => handleFieldChange('needsUpdate', checked)}

                            />

                            <span className="ml-2 text-sm">{formData.needsUpdate ? "Да" : "Нет"}</span>

                          </div>

                        ) : (

                          <Input value={formData.needsUpdate ? "Да" : "Нет"} readOnly className="bg-muted/50 text-base border-none focus-visible:ring-0" />

                        )}

                      </div>



                      <div className="space-y-2">

                        <label className="text-sm leading-none text-muted-foreground flex items-center gap-2">

                          <FileText className="h-4 w-4" />

                          Ссылка на задачу Jira

                        </label>

                        <Input 

                          value={formData.jiraTask || "Нет"} 

                          onChange={(e) => handleFieldChange('jiraTask', e.target.value)}

                          readOnly={!isEditing}

                          className="bg-muted/50 text-base border-none focus-visible:ring-0" 

                        />

                      </div>

                    </div>

                  </div>



                  <Separator />



                  {/* Comment Section */}

                  <div className="space-y-2">

                    <div className="flex items-center justify-between mb-2">

                      <label className="text-sm leading-none text-muted-foreground flex items-center gap-2">

                        <FileText className="h-4 w-4" />

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

                          <Server className="h-4 w-4" />

                          Хостинг файлов

                        </label>

                        <Input value={domain.fileHosting || "Нет"} readOnly className="bg-muted/50 text-base border-none focus-visible:ring-0" />

                      </div>



                      <div className="space-y-2">

                        <label className="text-sm leading-none text-muted-foreground flex items-center gap-2">

                          <Globe className="h-4 w-4" />

                          Регистратор

                        </label>

                        <Input value={domain.registrar || "Нет"} readOnly className="bg-muted/50 text-base border-none focus-visible:ring-0" />

                      </div>



                      <div className="space-y-2">

                        <label className="text-sm leading-none text-muted-foreground flex items-center gap-2">

                          <Server className="h-4 w-4" />

                          NS-записи

                        </label>

                        <div className="relative">

                          <Input 

                            value={domain.nsServers && domain.nsServers.length > 0 ? domain.nsServers.join(", ") : "—"} 

                            readOnly 

                            className="bg-muted/50 text-base border-none focus-visible:ring-0 pr-10 font-mono text-sm"

                          />

                          <Button

                            variant="ghost"

                            size="icon"

                            className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 hover:bg-muted"

                            onClick={() => {

                              if (domain.nsServers && domain.nsServers.length > 0) {

                                navigator.clipboard.writeText(domain.nsServers.join(", "));

                                toast.success("NS-записи скопированы");

                              }

                            }}

                          >

                            <Copy className="h-3.5 w-3.5" />

                          </Button>

                        </div>

                      </div>



                      <div className="space-y-2">

                        <label className="text-sm leading-none text-muted-foreground flex items-center gap-2">

                          <AlertCircle className="h-4 w-4" />

                          Тех. ограничения

                        </label>

                        <Input value={domain.techIssues && domain.techIssues.length > 0 ? "Да" : "Нет"} readOnly className="bg-muted/50 text-base border-none focus-visible:ring-0" />

                      </div>

                    </div>



                    {/* Column 2 */}

                    <div className="space-y-5">

                      <div className="space-y-2">

                        <label className="text-sm leading-none text-muted-foreground flex items-center gap-2">

                          <FileText className="h-4 w-4" />

                          Ссылка на Jira

                        </label>

                        <Input value={domain.jiraTask || "Нет"} readOnly className="bg-muted/50 text-base border-none focus-visible:ring-0" />

                      </div>



                      <div className="space-y-2">

                        <label className="text-sm leading-none text-muted-foreground flex items-center gap-2">

                          <CalendarIcon className="h-4 w-4" />

                          Дата покупки

                        </label>

                        <Input value={domain.expirationDate ? format(parseISO(domain.expirationDate), "dd.MM.yyyy") : "—"} readOnly className="bg-muted/50 text-base border-none focus-visible:ring-0" />

                      </div>



                      <div className="space-y-2">

                        <label className="text-sm leading-none text-muted-foreground flex items-center gap-2">

                          <CalendarIcon className="h-4 w-4" />

                          Дата продления

                        </label>

                        <Input value={domain.expirationDate ? format(parseISO(domain.expirationDate), "dd.MM.yyyy") : "—"} readOnly className="bg-muted/50 text-base border-none focus-visible:ring-0" />

                      </div>



                      <div className="space-y-2">

                        <label className="text-sm leading-none text-muted-foreground flex items-center gap-2">

                          <Code2 className="h-4 w-4" />

                          Метод тестирования

                        </label>

                        <Input value={domain.testMethod || "Нет"} readOnly className="bg-muted/50 text-base border-none focus-visible:ring-0" />

                      </div>

                    </div>

                  </div>



                  <Separator />



                  {/* Comment Section */}

                  <div className="space-y-2">

                    <div className="flex items-center justify-between mb-2">

                      <label className="text-sm leading-none text-muted-foreground flex items-center gap-2">

                        <FileText className="h-4 w-4" />

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

                      {domain.description ? (

                        <span className="text-muted-foreground">

                          {isAnalyticsNoteOpen 

                            ? domain.description 

                            : (domain.description.length > 100 

                                ? `${domain.description.substring(0, 100)}...` 

                                : domain.description

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

                          <BarChart3 className="h-4 w-4" />

                          Номер счетчика GA

                        </label>

                        <Input value={domain.gaId || "Нет"} readOnly className="bg-muted/50 text-base border-none focus-visible:ring-0" />

                      </div>

                    </div>



                    {/* Column 2 */}

                    <div className="space-y-5">

                      <div className="space-y-2">

                        <label className="text-sm leading-none text-muted-foreground flex items-center gap-2">

                          <Code2 className="h-4 w-4" />

                          Номер счетчика GTM

                        </label>

                        <Input value={domain.gtmId || "Нет"} readOnly className="bg-muted/50 text-base border-none focus-visible:ring-0" />

                      </div>

                    </div>

                  </div>



                  <Separator />



                  {/* Comment Section */}

                  <div className="space-y-2">

                    <div className="flex items-center justify-between mb-2">

                      <label className="text-sm leading-none text-muted-foreground flex items-center gap-2">

                        <FileText className="h-4 w-4" />

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

                      {domain.description ? (

                        <span className="text-muted-foreground">

                          {isAnalyticsNoteOpen 

                            ? domain.description 

                            : (domain.description.length > 100 

                                ? `${domain.description.substring(0, 100)}...` 

                                : domain.description

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

                          <Users className="h-4 w-4" />

                          Наличие в ПП

                        </label>

                        <Input value={domain.isInProgram ? "Да" : "Нет"} readOnly className="bg-muted/50 text-base border-none focus-visible:ring-0" />

                      </div>



                      <div className="space-y-2">

                        <label className="text-sm leading-none text-muted-foreground flex items-center gap-2">

                          <FileText className="h-4 w-4" />

                          Ссылка в ПП

                        </label>

                        <Input value={domain.programLink || "Нет"} readOnly className="bg-muted/50 text-base border-none focus-visible:ring-0" />

                      </div>

                    </div>



                    {/* Column 2 */}

                    <div className="space-y-5">

                      <div className="space-y-2">

                        <label className="text-sm leading-none text-muted-foreground flex items-center gap-2">

                          <Tag className="h-4 w-4" />

                          Имя компании

                        </label>

                        <Input value={domain.companyName || "Нет"} readOnly className="bg-muted/50 text-base border-none focus-visible:ring-0" />

                      </div>



                      <div className="space-y-2">

                        <label className="text-sm leading-none text-muted-foreground flex items-center gap-2">

                          <Activity className="h-4 w-4" />

                          Статус в ПП

                        </label>

                        <Input value={domain.programStatus || "Нет"} readOnly className="bg-muted/50 text-base border-none focus-visible:ring-0" />

                      </div>

                    </div>

                  </div>



                  <Separator />



                  {/* Comment Section */}

                  <div className="space-y-2">

                    <div className="flex items-center justify-between mb-2">

                      <label className="text-sm leading-none text-muted-foreground flex items-center gap-2">

                        <FileText className="h-4 w-4" />

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

                      {domain.description ? (

                        <span className="text-muted-foreground">

                          {isPartnershipNoteOpen 

                            ? domain.description 

                            : (domain.description.length > 100 

                                ? `${domain.description.substring(0, 100)}...` 

                                : domain.description

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

                      <Layers className="h-4 w-4" />

                      OneSignal App ID

                    </label>

                    <Input value={domain.oneSignalId || "Нет"} readOnly className="bg-muted/50 text-base border-none focus-visible:ring-0" />

                  </div>

                </div>



                {/* Column 2 */}

                <div className="space-y-5">

                  <div className="space-y-2">

                    <label className="text-sm leading-none text-muted-foreground flex items-center gap-2">

                      <Globe className="h-4 w-4" />

                      CloudFlare аккаунт

                    </label>

                    <Input value={domain.cloudflareAccount || "Нет"} readOnly className="bg-muted/50 text-base border-none focus-visible:ring-0" />

                  </div>

                </div>

              </div>



              <Separator />



              {/* Comment Section */}

              <div className="space-y-2">

                <div className="flex items-center justify-between mb-2">

                  <label className="text-sm leading-none text-muted-foreground flex items-center gap-2">

                    <FileText className="h-4 w-4" />

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

                  {domain.description ? (

                    <span className="text-muted-foreground">

                      {isIntegrationsNoteOpen 

                        ? domain.description 

                        : (domain.description.length > 100 

                            ? `${domain.description.substring(0, 100)}...` 

                            : domain.description

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

