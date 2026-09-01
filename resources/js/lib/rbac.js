export const ALL_MENUS = [
  "Dashboard",
  "Leads",
  "Clientes",
  "Campanas",
  "Seguimiento",
  "Ventas",
  "Asistente IA",
  "Cargar Venta",
  "Comunicados",
  "Agenda",
  "Calidad",
  "Reportes",
  "Usuarios",
  "Configuracion",
  "Ranking",
];

export const DEFAULT_ROLE_MENUS = {
  Gerente: [
    "Dashboard",
    "Asistente IA",
    "Leads",
    "Clientes",
    "Campanas",
    "Seguimiento",
    "Ventas",
    "Cargar Venta",
    "Comunicados",
    "Agenda",
    "Calidad",
    "Reportes",
    "Usuarios",
    "Configuracion",
    "Ranking",
  ],

  Admin: [
    "Dashboard",
    "Leads",
    "Clientes",
    "Campanas",
    "Seguimiento",
    "Ventas",
    "Cargar Venta",
    "Comunicados",
    "Agenda",
    "Calidad",
    "Reportes",
    "Usuarios",
    "Ranking",
    "Asistente IA",
  ],

  "Supervisor General": [
    "Dashboard",
    "Asistente IA",
    "Leads",
    "Clientes",
    "Seguimiento",
    "Ventas",
    "Cargar Venta",
    "Comunicados",
    "Agenda",
    "Calidad",
    "Reportes",
    "Ranking",
  ],

  Supervisor: [
    "Dashboard",
    "Leads",
    "Clientes",
    "Seguimiento",
    "Ventas",
    "Cargar Venta",
    "Comunicados",
    "Agenda",
    "Asistente IA",
    "Calidad",
    "Reportes",
    "Ranking",
  ],

  Backoffice: [
    "Dashboard",
    "Leads",
    "Clientes",
    "Asistente IA",
    "Seguimiento",
    "Ventas",
    "Comunicados",
    "Agenda",
    "Calidad",
    "Reportes",
  ],

  Comercial: [
    "Dashboard",
    "Leads",
    "Clientes",
    "Seguimiento",
    "Ventas",
    "Cargar Venta",
    "Comunicados",
    "Agenda",
    "Asistente IA",
    "Reportes",
    "Ranking",
  ],
};

export const ROLE_MENU_CONFIG_STORAGE_KEY =
  "crm_role_menu_config_v1";

export const ROLE_MENU_CONFIG_VERSION_STORAGE_KEY =
  "crm_role_menu_config_version_v1";

/*
 * Versión 4:
 * incorpora Supervisor General.
 */
export const ROLE_MENU_CONFIG_VERSION = 4;

const ROLE_ALIASES = {
  gerente: "Gerente",
  admin: "Admin",

  "supervisor general": "Supervisor General",

  supervisor: "Supervisor",

  backoffice: "Backoffice",
  "back office": "Backoffice",

  comercial: "Comercial",
};

function normalizeRole(role) {
  if (!role) return "";

  const key = String(role)
    .trim()
    .toLowerCase();

  return ROLE_ALIASES[key] || String(role).trim();
}

function getUserName(user) {
  return user?.nombre || user?.name || "";
}

function sanitizeMenus(menus) {
  if (!Array.isArray(menus)) return [];

  return ALL_MENUS.filter((menu) =>
    menus.includes(menu)
  );
}

function normalizeConfig(config) {
  return {
    Gerente: sanitizeMenus(
      config?.Gerente ??
        DEFAULT_ROLE_MENUS.Gerente
    ),

    Admin: sanitizeMenus(
      config?.Admin ??
        DEFAULT_ROLE_MENUS.Admin
    ),

    "Supervisor General": sanitizeMenus(
      config?.["Supervisor General"] ??
        DEFAULT_ROLE_MENUS["Supervisor General"]
    ),

    Supervisor: sanitizeMenus(
      config?.Supervisor ??
        DEFAULT_ROLE_MENUS.Supervisor
    ),

    Backoffice: sanitizeMenus(
      config?.Backoffice ??
        DEFAULT_ROLE_MENUS.Backoffice
    ),

    Comercial: sanitizeMenus(
      config?.Comercial ??
        DEFAULT_ROLE_MENUS.Comercial
    ),
  };
}

function persistRoleMenuConfig(config) {
  const normalized =
    normalizeConfig(config);

  try {
    localStorage.setItem(
      ROLE_MENU_CONFIG_STORAGE_KEY,
      JSON.stringify(normalized)
    );

    localStorage.setItem(
      ROLE_MENU_CONFIG_VERSION_STORAGE_KEY,
      String(ROLE_MENU_CONFIG_VERSION)
    );
  } catch {
    //
  }

  return normalized;
}

function migrateOldConfig(config) {
  return {
    Gerente: sanitizeMenus([
      ...(config?.Gerente ?? []),
      ...DEFAULT_ROLE_MENUS.Gerente,
    ]),

    Admin: sanitizeMenus([
      ...(config?.Admin ?? []),
      ...DEFAULT_ROLE_MENUS.Admin,
    ]),

    "Supervisor General": sanitizeMenus([
      ...(config?.["Supervisor General"] ?? []),
      ...DEFAULT_ROLE_MENUS[
        "Supervisor General"
      ],
    ]),

    Supervisor: sanitizeMenus([
      ...(config?.Supervisor ?? []),
      ...DEFAULT_ROLE_MENUS.Supervisor,
    ]),

    Backoffice: sanitizeMenus([
      ...(config?.Backoffice ?? []),
      ...DEFAULT_ROLE_MENUS.Backoffice,
    ]),

    Comercial: sanitizeMenus([
      ...(config?.Comercial ?? []),
      ...DEFAULT_ROLE_MENUS.Comercial,
    ]),
  };
}

export function getRoleMenuConfig() {
  try {
    const saved =
      localStorage.getItem(
        ROLE_MENU_CONFIG_STORAGE_KEY
      );

    const savedVersion = Number(
      localStorage.getItem(
        ROLE_MENU_CONFIG_VERSION_STORAGE_KEY
      ) || 0
    );

    if (!saved) {
      return persistRoleMenuConfig(
        DEFAULT_ROLE_MENUS
      );
    }

    const parsed = JSON.parse(saved);

    if (
      savedVersion <
      ROLE_MENU_CONFIG_VERSION
    ) {
      const migrated =
        migrateOldConfig(parsed);

      return persistRoleMenuConfig(
        migrated
      );
    }

    return normalizeConfig(parsed);
  } catch {
    return persistRoleMenuConfig(
      DEFAULT_ROLE_MENUS
    );
  }
}

export function saveRoleMenuConfig(
  config
) {
  return persistRoleMenuConfig(config);
}

export function resetRoleMenuConfig() {
  return persistRoleMenuConfig(
    DEFAULT_ROLE_MENUS
  );
}

export function applyServerRoleMenuConfig(
  config
) {
  const saved =
    persistRoleMenuConfig(config);

  window.dispatchEvent(
    new CustomEvent(
      "crm-role-menus-updated"
    )
  );

  return saved;
}

export function getVisibleMenus(user) {
  if (!user) return [];

  const roleMenus =
    getRoleMenuConfig();

  const role =
    normalizeRole(user.rol);

  return roleMenus[role] || [];
}

export function canExport(user) {
  if (!user) return false;

  const role =
    normalizeRole(user.rol);

  return [
    "Gerente",
    "Admin",
    "Backoffice",
  ].includes(role);
}

export function canEditVenta(user) {
  if (!user) return false;

  const role =
    normalizeRole(user.rol);

  /*
   * Supervisor General puede visualizar
   * las ventas de sus campañas,
   * pero NO editarlas.
   */
  return [
    "Gerente",
    "Admin",
    "Backoffice",
  ].includes(role);
}

export function canEditOnlyEstadoVenta(
  user
) {
  if (!user) return false;

  const role =
    normalizeRole(user.rol);

  return role === "Backoffice";
}

export function canManageUsers(user) {
  if (!user) return false;

  const role =
    normalizeRole(user.rol);

  return [
    "Gerente",
    "Admin",
  ].includes(role);
}

export function canSeeComunicados(
  user
) {
  if (!user) return false;

  const role =
    normalizeRole(user.rol);

  return [
    "Gerente",
    "Admin",
    "Supervisor General",
    "Supervisor",
    "Backoffice",
    "Comercial",
  ].includes(role);
}

export function canCreateComunicados(
  user
) {
  if (!user) return false;

  const role =
    normalizeRole(user.rol);

  return [
    "Gerente",
    "Admin",
    "Supervisor General",
    "Supervisor",
    "Backoffice",
  ].includes(role);
}

export function getAllowedCampaigns(
  user
) {
  if (!user) return [];

  const role =
    normalizeRole(user.rol);

  /*
   * Gerente tiene acceso global.
   */
  if (role === "Gerente") {
    return null;
  }

  if (
    Array.isArray(
      user.allowedCampaigns
    ) &&
    user.allowedCampaigns.length > 0
  ) {
    return user.allowedCampaigns;
  }

  if (
    typeof user.allowedCampaigns ===
      "string" &&
    user.allowedCampaigns.trim() !== ""
  ) {
    try {
      const parsed = JSON.parse(
        user.allowedCampaigns
      );

      if (
        Array.isArray(parsed) &&
        parsed.length > 0
      ) {
        return parsed;
      }
    } catch {
      //
    }
  }

  if (user.campana) {
    return [user.campana];
  }

  return [];
}

export function filterCampaignsByUser(
  campaigns,
  currentUser
) {
  if (!currentUser) return [];

  const role =
    normalizeRole(currentUser.rol);

  if (role === "Gerente") {
    return campaigns;
  }

  const allowed =
    getAllowedCampaigns(currentUser);

  if (allowed === null) {
    return campaigns;
  }

  return campaigns.filter((c) =>
    allowed.includes(c.nombre)
  );
}

export function filterUsersByUser(
  users,
  currentUser
) {
  if (!currentUser) return [];

  const role =
    normalizeRole(currentUser.rol);

  const currentName =
    getUserName(currentUser);

  /*
   * GERENTE
   * Ve todos los usuarios.
   */
  if (role === "Gerente") {
    return users;
  }

  /*
   * ADMIN
   * No puede visualizar Gerentes.
   * Se limita a sus campañas.
   */
  if (role === "Admin") {
    const allowed =
      getAllowedCampaigns(
        currentUser
      );

    return users.filter((u) => {
      const userRole =
        normalizeRole(u.rol);

      if (
        userRole === "Gerente"
      ) {
        return false;
      }

      if (allowed === null) {
        return true;
      }

      if (
        Array.isArray(
          u.allowedCampaigns
        ) &&
        u.allowedCampaigns.length > 0
      ) {
        return (
          u.allowedCampaigns.some(
            (c) =>
              allowed.includes(c)
          )
        );
      }

      return (
        !u.campana ||
        allowed.includes(u.campana)
      );
    });
  }

  /*
   * SUPERVISOR GENERAL
   *
   * Ve los usuarios que pertenecen
   * a cualquiera de sus campañas
   * asignadas.
   *
   * No ve Gerente ni Admin.
   */
  if (
    role === "Supervisor General"
  ) {
    const allowed =
      getAllowedCampaigns(
        currentUser
      );

    if (
      !allowed ||
      allowed.length === 0
    ) {
      return users.filter(
        (u) =>
          getUserName(u) ===
          currentName
      );
    }

    return users.filter((u) => {
      const userName =
        getUserName(u);

      const userRole =
        normalizeRole(u.rol);

      if (
        userName === currentName
      ) {
        return true;
      }

      if (
        [
          "Gerente",
          "Admin",
        ].includes(userRole)
      ) {
        return false;
      }

      if (
        Array.isArray(
          u.allowedCampaigns
        ) &&
        u.allowedCampaigns.length > 0
      ) {
        return (
          u.allowedCampaigns.some(
            (c) =>
              allowed.includes(c)
          )
        );
      }

      return allowed.includes(
        u.campana
      );
    });
  }

  /*
   * SUPERVISOR
   * Solo ve su equipo.
   */
  if (role === "Supervisor") {
    return users.filter((u) => {
      const userName =
        getUserName(u);

      return (
        userName === currentName ||
        u.coordinador ===
          currentName ||
        u.supervisor ===
          currentName
      );
    });
  }

  /*
   * BACKOFFICE
   */
  if (role === "Backoffice") {
    const allowed =
      getAllowedCampaigns(
        currentUser
      );

    if (
      !allowed ||
      allowed.length === 0
    ) {
      return users.filter(
        (u) =>
          getUserName(u) ===
          currentName
      );
    }

    return users.filter((u) => {
      const userName =
        getUserName(u);

      if (
        userName === currentName
      ) {
        return true;
      }

      if (
        Array.isArray(
          u.allowedCampaigns
        ) &&
        u.allowedCampaigns.length > 0
      ) {
        return (
          u.allowedCampaigns.some(
            (c) =>
              allowed.includes(c)
          )
        );
      }

      return allowed.includes(
        u.campana
      );
    });
  }

  /*
   * COMERCIAL
   */
  if (role === "Comercial") {
    return users.filter(
      (u) =>
        getUserName(u) ===
        currentName
    );
  }

  return [];
}

export function filterVentasByUser(
  ventas,
  currentUser
) {
  if (!currentUser) return [];

  const role =
    normalizeRole(currentUser.rol);

  const currentName =
    getUserName(currentUser);

  /*
   * GERENTE
   * Ve todas las ventas.
   */
  if (role === "Gerente") {
    return ventas;
  }

  /*
   * ADMIN
   * Ventas de sus campañas.
   */
  if (role === "Admin") {
    const allowed =
      getAllowedCampaigns(
        currentUser
      );

    if (allowed === null) {
      return ventas;
    }

    return ventas.filter(
      (v) =>
        allowed.includes(v.campana)
    );
  }

  /*
   * SUPERVISOR GENERAL
   *
   * Ve las ventas de TODOS los
   * comerciales siempre que la
   * venta pertenezca a una de
   * sus campañas asignadas.
   */
  if (
    role === "Supervisor General"
  ) {
    const allowed =
      getAllowedCampaigns(
        currentUser
      );

    if (
      !allowed ||
      allowed.length === 0
    ) {
      return [];
    }

    return ventas.filter(
      (v) =>
        allowed.includes(v.campana)
    );
  }

  /*
   * SUPERVISOR
   * Ventas de su equipo.
   */
  if (role === "Supervisor") {
    return ventas.filter(
      (v) =>
        v.supervisor ===
          currentName ||
        v.coordinador ===
          currentName
    );
  }

  /*
   * BACKOFFICE
   */
  if (role === "Backoffice") {
    const allowed =
      getAllowedCampaigns(
        currentUser
      );

    if (
      allowed === null ||
      allowed.length === 0
    ) {
      return ventas;
    }

    return ventas.filter(
      (v) =>
        allowed.includes(v.campana)
    );
  }

  /*
   * COMERCIAL
   * Solo sus propias ventas.
   */
  if (role === "Comercial") {
    return ventas.filter(
      (v) =>
        v.comercial ===
        currentName
    );
  }

  return [];
}

export function filterLeadsByUser(
  leads,
  currentUser
) {
  if (!currentUser) return [];

  const role =
    normalizeRole(currentUser.rol);

  if (role === "Gerente") {
    return leads;
  }

  /*
   * Admin, Supervisor General,
   * Supervisor, Backoffice y Comercial
   * quedan limitados a sus campañas
   * permitidas.
   */
  const allowed =
    getAllowedCampaigns(currentUser);

  if (allowed === null) {
    return leads;
  }

  return leads.filter(
    (l) =>
      allowed.includes(l.campana)
  );
}
