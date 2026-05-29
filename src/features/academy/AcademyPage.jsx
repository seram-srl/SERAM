import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, BookOpenCheck, Lock, Trash2, Star, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';

const pageVariants = {
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } },
  exit: { opacity: 0, y: -12, transition: { duration: 0.3 } },
};

export default function AcademyPage() {
  const navigate = useNavigate();
  const {
    courses, activeRole, hasPremiumAccess, currentSocio,
    handleAccessItem, handleDeleteCourse, triggerToast,
  } = useApp();

  return (
    <motion.div
      variants={pageVariants} initial="initial" animate="animate" exit="exit"
      className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto"
    >
      {/* Header Banner */}
      <div className="glass-panel-dark border border-[#00e03c]/20 rounded-2xl p-8 mb-12 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 bg-[#00e03c]/10 text-[#00e03c] px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border border-[#00e03c]/20">
            <BookOpen className="w-3 h-3" /> SERAM ACADEMY
          </div>
          <h1 className="text-3xl font-black text-white">Plataforma Académica de Posgrados</h1>
          <p className="text-sm text-slate-400 max-w-2xl">
            Formamos especialistas ambientales de clase mundial con el respaldo y docencia de nuestros socios clave.
            Explora y edita las materias en base a tu rol en la plataforma.
          </p>
        </div>
        <div className="shrink-0 glass-panel-dark p-4 rounded-xl border border-white/10 flex items-center gap-3">
          <div className="p-2.5 bg-[#00e03c]/10 text-[#00e03c] rounded-lg">
            <Star className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-slate-500">Acreditaciones</div>
            <div className="font-black text-white">Normativa ISO / ODS</div>
          </div>
        </div>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">

        {/* Course List */}
        <div className={activeRole === 'AdminMod' ? 'lg:col-span-8 space-y-6' : 'lg:col-span-12 space-y-6'}>
          <div className="flex justify-between items-center">
            <h2 className="font-extrabold text-lg text-white">Cursos & Diplomados</h2>
            <span className="text-xs text-slate-500">Mostrando {courses.length} registros</span>
          </div>

          <div className="space-y-4">
            {courses.map(course => (
              <div key={course.id} className="glass-panel-dark rounded-xl p-6 border border-white/[0.06] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:border-white/12 transition-all">
                <div className="flex gap-4 items-start">
                  <div className="p-3.5 bg-[#00e03c]/10 text-[#00e03c] rounded-xl shrink-0">
                    <BookOpenCheck className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-base">{course.title}</h3>
                    <p className="text-xs text-slate-500">Instructor: <strong className="text-slate-300">{course.instructor}</strong></p>
                    <div className="flex gap-3 items-center mt-2">
                      <span className="bg-white/10 text-slate-400 text-[10px] font-bold px-2 py-0.5 rounded">{course.students} estudiantes</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${course.status === 'Activo' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'}`}>
                        {course.status}
                      </span>
                      {course.isPremium && (
                        <span className="bg-amber-500/10 text-amber-400 text-[10px] font-bold px-2 py-0.5 rounded">Pro Premium</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => handleAccessItem(course, 'course', () => triggerToast(`Abriendo: ${course.title}`, 'success'))}
                    className="bg-[#00e03c]/10 border border-[#00e03c]/30 text-[#00e03c] text-xs font-bold px-4 py-2 rounded-lg hover:bg-[#00e03c]/20 transition-colors flex items-center gap-1.5"
                  >
                    {course.isPremium && !hasPremiumAccess && <Lock className="w-3.5 h-3.5 text-amber-400 animate-pulse" />}
                    Ver Contenido
                  </button>
                  {activeRole === 'AdminMod' && (
                    <button
                      onClick={() => handleDeleteCourse(course.id)}
                      className="p-2 text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                      title="Eliminar curso"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Admin Panel / Access Info (Solo visible para socios logueados) */}
        {activeRole === 'AdminMod' && (
          <div className="lg:col-span-4 space-y-6">
            <div className="glass-panel-dark border border-white/[0.06] rounded-xl p-6 space-y-4">
              <div className="flex items-center gap-2 border-b border-white/[0.06] pb-3">
                <Shield className="w-4 h-4 text-rose-400" />
                <h3 className="font-bold text-sm text-white">Panel de Gestión de Socios</h3>
              </div>

              {currentSocio && (
                <div className="bg-[#00e03c]/5 rounded-xl p-4 text-center space-y-3 border border-[#00e03c]/20">
                  <Shield className="w-8 h-8 text-[#00e03c] mx-auto animate-pulse" />
                  <p className="text-xs text-slate-300 font-semibold">¡Hola, {currentSocio.name.split(' ')[1]}!</p>
                  <p className="text-xs text-slate-500">Para registrar y administrar cursos, dirígete a tu Dashboard directivo.</p>
                  <button
                    onClick={() => navigate('/dashboard')}
                    className="w-full bg-[#00e03c]/10 border border-[#00e03c]/30 text-[#00e03c] py-2 rounded-lg font-bold text-xs uppercase hover:bg-[#00e03c]/20"
                  >
                    Ir al Dashboard
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}
