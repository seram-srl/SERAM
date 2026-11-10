/**
 * @file ClientsModule.jsx
 * @description Módulo Principal de Clientes y Gestión Comercial en el Portal de Socios de SERAM SRL.
 * Reemplaza la vista heredada por la suite completa de Odoo CRM & ARM (Automated Relationship Machine),
 * conectando la base de datos de clientes reales, el directorio B2B SEPREC, la precalificación del
 * Asistente Web SERAM, las Misiones Clave por tipo (Flash, Grupal, Secundaria, Especialidad) y la Meritocracia XP.
 */

import React from 'react';
import ArmOdooCrm from './crm/ArmOdooCrm';

export default function ClientsModule({ currentSocio, onNavigate }) {
  return (
    <div className="w-full relative z-10">
      <ArmOdooCrm currentSocio={currentSocio} onNavigate={onNavigate} />
    </div>
  );
}
