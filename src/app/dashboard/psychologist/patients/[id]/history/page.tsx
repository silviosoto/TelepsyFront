"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
    FileText, Save, ArrowLeft, History, User, Heart, Activity,
    BookOpen, Shield, Brain, Info, Stethoscope, MessageSquare
} from "lucide-react";
import { Button } from "@/components/Button";
import { clinicalHistoryService } from "@/services/clinical-history.service";
import { toast } from "sonner";

export default function ClinicalHistoryPage() {
    const params = useParams();
    const router = useRouter();
    const patientId = Number(params.id);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [activeSection, setActiveSection] = useState("fisico");

    const [formData, setFormData] = useState<any>({
        lacerations: "", hematomas: "", burns: "", scars: "", fractures: "", physicalObservations: "",
        cognitiveDisability: "", epilepsy: "", hereditaryFamilyDiseases: "", psychoactiveSubstanceConsumption: "",
        alcoholConsumption: "", mentalHealthDiagnosis: "", suicideAttempts: "", traumaticEvents: "",
        isMedicated: "", selfHarmHistory: "", psychiatricHospitalizations: "", mentalHealthObservations: "",
        schoolEntryAge: "", initialAdaptation: "", academicPerformance: "", lostYears: "", currentGrade: "",
        easyAndDifficultSubjects: "", dailyStudyTimeHours: "",
        familyEnvironmentRelated: "", socialEnvironmentRelated: "", academicEnvironmentRelated: "", individualCharacteristicsRelated: "",
        developmentAge: "", sexualIdentity: "", sexualOrientation: "", ageOfFirstSexualIntercourse: "",
        familyPlanningMethodsUse: "", hasBeenSexuallyAbused: "", sexuallyTransmittedDiseases: "", teenageParent: "",
        consciousnessLevel: "", attention: "", sensoryPerception: "", affect: "", language: "", orientation: "",
        sleep: "", thought: "", motorConduct: "", memory: "", feedingPattern: "", intelligence: "",
        reasoningLevel: "", postureAndAttitude: "",
        analysis: "", mainDiagnosis: "", treatmentPlan: "", objectives: "", recommendations: "", commitments: ""
    });

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const data = await clinicalHistoryService.getClinicalHistory(patientId);
                if (data) {
                    setFormData(data);
                }
            } catch (error) {
                console.error("Error fetching history:", error);
                toast.error("Error al cargar la historia clínica");
            } finally {
                setIsLoading(false);
            }
        };

        if (patientId) fetchHistory();
    }, [patientId]);

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev: any) => ({ ...prev, [name]: value }));
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            await clinicalHistoryService.updateClinicalHistory(patientId, formData);
            toast.success("Historia clínica guardada correctamente");
        } catch (error) {
            console.error("Error saving history:", error);
            toast.error("Error al guardar los cambios");
        } finally {
            setIsSaving(false);
        }
    };

    const sections = [
        { id: "fisico", label: "Signos Físicos", icon: Stethoscope },
        { id: "mental", label: "Salud Mental", icon: Heart },
        { id: "academico", label: "Hist. Académica", icon: BookOpen },
        { id: "conducta", label: "Conducta", icon: Activity },
        { id: "psicosexual", label: "Psicosexual", icon: Shield },
        { id: "examen", label: "Examen Mental", icon: Brain },
        { id: "concepto", label: "Concepto", icon: Info },
    ];

    if (isLoading) {
        return (
            <div className="flex h-[60vh] items-center justify-center">
                <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-6 pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => router.back()}
                        className="p-2 hover:bg-secondary/10 rounded-xl transition-colors text-foreground/40"
                    >
                        <ArrowLeft className="w-6 h-6" />
                    </button>
                    <div>
                        <h1 className="text-3xl font-bold text-foreground">Historia Clínica</h1>
                        <p className="text-foreground/40">Registro detallado y seguimiento psicológico</p>
                    </div>
                </div>
                <Button
                    variant="primary"
                    onClick={handleSave}
                    isLoading={isSaving}
                    className="rounded-2xl h-12 px-8 shadow-lg shadow-primary/20"
                >
                    <Save className="w-4 h-4 mr-2" /> Guardar Cambios
                </Button>
            </div>

            <div className="grid lg:grid-cols-4 gap-8">
                {/* Sidebar Navigation */}
                <div className="lg:col-span-1 space-y-2">
                    {sections.map((section) => {
                        const Icon = section.icon;
                        return (
                            <button
                                key={section.id}
                                onClick={() => setActiveSection(section.id)}
                                className={`w-full flex items-center gap-3 px-6 py-4 rounded-2xl transition-all font-bold text-sm ${activeSection === section.id
                                    ? "bg-primary text-white shadow-md shadow-primary/20 scale-[1.02]"
                                    : "bg-white text-foreground/50 hover:bg-secondary/10"
                                    }`}
                            >
                                <Icon className="w-5 h-5" />
                                {section.label}
                            </button>
                        );
                    })}
                </div>

                {/* Content Area */}
                <div className="lg:col-span-3">
                    <motion.div
                        key={activeSection}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white rounded-[2rem] p-8 shadow-sm border border-glass-border min-h-[600px]"
                    >
                        {/* Render Sections */}
                        {activeSection === "fisico" && (
                            <div className="space-y-6">
                                <SectionHeader title="Signos Físicos" />
                                <div className="grid md:grid-cols-2 gap-4">
                                    <InputField label="Laceraciones" name="lacerations" value={formData.lacerations} onChange={handleChange} />
                                    <InputField label="Hematomas" name="hematomas" value={formData.hematomas} onChange={handleChange} />
                                    <InputField label="Quemaduras" name="burns" value={formData.burns} onChange={handleChange} />
                                    <InputField label="Cicatrices" name="scars" value={formData.scars} onChange={handleChange} />
                                    <InputField label="Fracturas" name="fractures" value={formData.fractures} onChange={handleChange} />
                                </div>
                                <TextAreaField label="Observaciones" name="physicalObservations" value={formData.physicalObservations} onChange={handleChange} />
                            </div>
                        )}

                        {activeSection === "mental" && (
                            <div className="space-y-6">
                                <SectionHeader title="Salud Mental Personal y Familiar" />
                                <div className="grid md:grid-cols-2 gap-4">
                                    <InputField label="Discapacidad Cognitiva" name="cognitiveDisability" value={formData.cognitiveDisability} onChange={handleChange} />
                                    <InputField label="Epilepsia" name="epilepsia" value={formData.epilepsia} onChange={handleChange} />
                                    <InputField label="Enfermedades Familiares" name="hereditaryFamilyDiseases" value={formData.hereditaryFamilyDiseases} onChange={handleChange} />
                                    <InputField label="Consumo SPA" name="psychoactiveSubstanceConsumption" value={formData.psychoactiveSubstanceConsumption} onChange={handleChange} />
                                    <InputField label="Consumo Alcohol" name="alcoholConsumption" value={formData.alcoholConsumption} onChange={handleChange} />
                                    <InputField label="DX Salud Mental" name="mentalHealthDiagnosis" value={formData.mentalHealthDiagnosis} onChange={handleChange} />
                                    <InputField label="Intento Suicidio" name="suicideAttempts" value={formData.suicideAttempts} onChange={handleChange} />
                                    <InputField label="Eventos Traumáticos" name="traumaticEvents" value={formData.traumaticEvents} onChange={handleChange} />
                                    <InputField label="Medicado" name="isMedicated" value={formData.isMedicated} onChange={handleChange} />
                                    <InputField label="Autolesión" name="selfHarmHistory" value={formData.selfHarmHistory} onChange={handleChange} />
                                    <InputField label="Internaciones" name="psychiatricHospitalizations" value={formData.psychiatricHospitalizations} onChange={handleChange} />
                                </div>
                                <TextAreaField label="Observaciones" name="mentalHealthObservations" value={formData.mentalHealthObservations} onChange={handleChange} />
                            </div>
                        )}

                        {activeSection === "academico" && (
                            <div className="space-y-6">
                                <SectionHeader title="Historia Académica" />
                                <div className="grid md:grid-cols-2 gap-4">
                                    <InputField label="Edad Ingreso Escuela" name="schoolEntryAge" value={formData.schoolEntryAge} onChange={handleChange} />
                                    <InputField label="Adaptación Inicial" name="initialAdaptation" value={formData.initialAdaptation} onChange={handleChange} />
                                    <InputField label="Desempeño Académico" name="academicPerformance" value={formData.academicPerformance} onChange={handleChange} />
                                    <InputField label="Años Perdidos" name="lostYears" value={formData.lostYears} onChange={handleChange} />
                                    <InputField label="Curso Actual" name="currentGrade" value={formData.currentGrade} onChange={handleChange} />
                                    <InputField label="Materias Faciles/Difíciles" name="easyAndDifficultSubjects" value={formData.easyAndDifficultSubjects} onChange={handleChange} />
                                    <InputField label="Horas Estudio Diarias" name="dailyStudyTimeHours" value={formData.dailyStudyTimeHours} onChange={handleChange} />
                                </div>
                            </div>
                        )}

                        {activeSection === "conducta" && (
                            <div className="space-y-6">
                                <SectionHeader title="Razones de Síntomas / Conducta" />
                                <div className="space-y-4">
                                    <InputField label="Ambiente Familiar" name="familyEnvironmentRelated" value={formData.familyEnvironmentRelated} onChange={handleChange} />
                                    <InputField label="Ambiente Social" name="socialEnvironmentRelated" value={formData.socialEnvironmentRelated} onChange={handleChange} />
                                    <InputField label="Ambiente Académico" name="academicEnvironmentRelated" value={formData.academicEnvironmentRelated} onChange={handleChange} />
                                    <InputField label="Características Individuales" name="individualCharacteristicsRelated" value={formData.individualCharacteristicsRelated} onChange={handleChange} />
                                </div>
                            </div>
                        )}

                        {activeSection === "psicosexual" && (
                            <div className="space-y-6">
                                <SectionHeader title="Desarrollo Psicosexual" />
                                <div className="grid md:grid-cols-2 gap-4">
                                    <InputField label="Edad Desarrollo" name="developmentAge" value={formData.developmentAge} onChange={handleChange} />
                                    <InputField label="Identidad Sexual" name="sexualIdentity" value={formData.sexualIdentity} onChange={handleChange} />
                                    <InputField label="Orientación Sexual" name="sexualOrientation" value={formData.sexualOrientation} onChange={handleChange} />
                                    <InputField label="Edad Inicio Vida Sexual" name="ageOfFirstSexualIntercourse" value={formData.ageOfFirstSexualIntercourse} onChange={handleChange} />
                                    <InputField label="Métodos Planificación" name="familyPlanningMethodsUse" value={formData.familyPlanningMethodsUse} onChange={handleChange} />
                                    <InputField label="Víctima Abuso" name="hasBeenSexuallyAbused" value={formData.hasBeenSexuallyAbused} onChange={handleChange} />
                                    <InputField label="ETS" name="sexuallyTransmittedDiseases" value={formData.sexuallyTransmittedDiseases} onChange={handleChange} />
                                    <InputField label="Madre/Padre Adolescente" name="teenageParent" value={formData.teenageParent} onChange={handleChange} />
                                </div>
                            </div>
                        )}

                        {activeSection === "examen" && (
                            <div className="space-y-6">
                                <SectionHeader title="Examen de Estado Mental" />
                                <div className="grid md:grid-cols-2 gap-4">
                                    <InputField label="Nivel Conciencia" name="consciousnessLevel" value={formData.consciousnessLevel} onChange={handleChange} />
                                    <InputField label="Atención" name="attention" value={formData.attention} onChange={handleChange} />
                                    <InputField label="Sensopercepción" name="sensoryPerception" value={formData.sensoryPerception} onChange={handleChange} />
                                    <InputField label="Afecto" name="affect" value={formData.affect} onChange={handleChange} />
                                    <InputField label="Lenguaje" name="language" value={formData.language} onChange={handleChange} />
                                    <InputField label="Orientación" name="orientation" value={formData.orientation} onChange={handleChange} />
                                    <InputField label="Sueño" name="sleep" value={formData.sleep} onChange={handleChange} />
                                    <InputField label="Pensamiento" name="thought" value={formData.thought} onChange={handleChange} />
                                    <InputField label="Conducta Motora" name="motorConduct" value={formData.motorConduct} onChange={handleChange} />
                                    <InputField label="Memoria" name="memory" value={formData.memory} onChange={handleChange} />
                                    <InputField label="Patrón Alimentar" name="feedingPattern" value={formData.feedingPattern} onChange={handleChange} />
                                    <InputField label="Inteligencia" name="intelligence" value={formData.intelligence} onChange={handleChange} />
                                    <InputField label="Nivel Razonamiento" name="reasoningLevel" value={formData.reasoningLevel} onChange={handleChange} />
                                    <InputField label="Porte y Actitud" name="postureAndAttitude" value={formData.postureAndAttitude} onChange={handleChange} />
                                </div>
                            </div>
                        )}

                        {activeSection === "concepto" && (
                            <div className="space-y-6">
                                <SectionHeader title="Concepto Psicológico" />
                                <TextAreaField label="Análisis" name="analysis" value={formData.analysis} onChange={handleChange} height="120px" />
                                <InputField label="Diagnóstico Principal" name="mainDiagnosis" value={formData.mainDiagnosis} onChange={handleChange} />
                                <TextAreaField label="Plan Tratamiento" name="treatmentPlan" value={formData.treatmentPlan} onChange={handleChange} />
                                <div className="grid md:grid-cols-2 gap-4">
                                    <TextAreaField label="Objetivos" name="objectives" value={formData.objectives} onChange={handleChange} />
                                    <TextAreaField label="Recomendaciones" name="recommendations" value={formData.recommendations} onChange={handleChange} />
                                </div>
                                <TextAreaField label="Compromisos" name="commitments" value={formData.commitments} onChange={handleChange} />
                            </div>
                        )}
                    </motion.div>
                </div>
            </div>
        </div>
    );
}

function SectionHeader({ title }: { title: string }) {
    return <h2 className="text-2xl font-bold text-foreground mb-8 pb-2 border-b-2 border-primary/10 tracking-tight">{title}</h2>;
}

function InputField({ label, name, value, onChange }: any) {
    return (
        <div className="space-y-1.5 flex flex-col">
            <label className="text-[11px] font-bold text-foreground/40 uppercase tracking-widest pl-1">{label}</label>
            <input
                type="text"
                name={name}
                value={value || ""}
                onChange={onChange}
                placeholder="---"
                className="bg-secondary/5 border-transparent focus:bg-white focus:border-primary/20 rounded-xl px-4 py-3 text-sm outline-none transition-all border group-hover:border-primary/10"
            />
        </div>
    );
}

function TextAreaField({ label, name, value, onChange, height = "80px" }: any) {
    return (
        <div className="space-y-1.5 flex flex-col w-full">
            <label className="text-[11px] font-bold text-foreground/40 uppercase tracking-widest pl-1">{label}</label>
            <textarea
                name={name}
                value={value || ""}
                onChange={onChange}
                placeholder="Describe los hallazgos aquí..."
                style={{ height }}
                className="bg-secondary/5 border-transparent focus:bg-white focus:border-primary/20 rounded-2xl px-4 py-3 text-sm outline-none transition-all border group-hover:border-primary/10 resize-none w-full"
            />
        </div>
    );
}
