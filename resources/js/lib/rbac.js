export const ALL_MENUS = [
  "Dashboard",
  "Leads",
  "Clientes",
  "Campanas",
  "Seguimiento",
  "Ventas",
  "Cargar Venta",
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
    "Leads",
    "Clientes",
    "Campanas",
    "Seguimiento",
    "Ventas",
    "Cargar Venta",
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
    "Agenda",
    "Calidad",
    "Reportes",
    "Usuarios",
    "Ranking",
  ],
  Supervisor: [
    "Dashboard",
    "Seguimiento",
    "Ventas",
    "Agenda",
    "Reportes",
    "Ranking",
  ],
  Backoffice: [
    "Dashboard",
    "Ventas",
    "Seguimiento",
    "Reportes",
  ],
  Comercial: [
    "Ventas",
    "Reportes",
    "Cargar Venta",
    "Ranking",
  ],
};

export const ROLE_MENU_CONFIG_STORAGE_KEY = "crm_role_menu_config_v1";

function sanitizeMenus(menus) {
  if (!Array.isArray(menus)) return [];
  return ALL_MENUS.filter((menu) => menus.includes(menu));
}

export function getRoleMenuConfig() {
  try {
    const saved = localStorage.getItem(ROLE_MENU_CONFIG_STORAGE_KEY);
    if (!saved) return DEFAULT_ROLE_MENUS;

    const parsed = JSON.parse(saved);

    return {
      Gerente: sanitizeMenus(parsed?.Gerente ?? DEFAULT_ROLE_MENUS.Gerente),
      Admin: sanitizeMenus(parsed?.Admin ?? DEFAULT_ROLE_MENUS.Admin),
      Supervisor: sanitizeMenus(parsed?.Supervisor ?? DEFAULT_ROLE_MENUS.Supervisor),
      Backoffice: sanitizeMenus(parsed?.Backoffice ?? DEFAULT_ROLE_MENUS.Backoffice),
      Comercial: sanitizeMenus(parsed?.Comercial ?? DEFAULT_ROLE_MENUS.Comercial),
    };
  } catch {
    return DEFAULT_ROLE_MENUS;
  }
}

export function saveRoleMenuConfig(config) {
  const normalized = {
    Gerente: sanitizeMenus(config?.Gerente ?? DEFAULT_ROLE_MENUS.Gerente),
    Admin: sanitizeMenus(config?.Admin ?? DEFAULT_ROLE_MENUS.Admin),
    Supervisor: sanitizeMenus(config?.Supervisor ?? DEFAULT_ROLE_MENUS.Supervisor),
    Backoffice: sanitizeMenus(config?.Backoffice ?? DEFAULT_ROLE_MENUS.Backoffice),
    Comercial: sanitizeMenus(config?.Comercial ?? DEFAULT_ROLE_MENUS.Comercial),
  };

  localStorage.setItem(
    ROLE_MENU_CONFIG_STORAGE_KEY,
    JSON.stringify(normalized)
  );

  return normalized;
}

export function resetRoleMenuConfig() {
  localStorage.setItem(
    ROLE_MENU_CONFIG_STORAGE_KEY,
    JSON.stringify(DEFAULT_ROLE_MENUS)
  );
  return DEFAULT_ROLE_MENUS;
}

export function getVisibleMenus(user) {
  if (!user) return [];
  const roleMenus = getRoleMenuConfig();
  return roleMenus[user.rol] || [];
}

export function canExport(user) {
  if (!user) return false;
  if (user.rol === "Supervisor") return false;
  return ["Gerente", "Admin", "Backoffice"].includes(user.rol);
}

export function canEditVenta(user) {
  if (!user) return false;
  return ["Gerente", "Admin", "Backoffice"].includes(user.rol);
}

export function canEditOnlyEstadoVenta(user) {
  if (!user) return false;
  return user.rol === "Backoffice";
}

export function canManageUsers(user) {
  if (!user) return false;
  return ["Gerente"].includes(user.rol);
}

export function getAllowedCampaigns(user) {
  if (!user) return [];
  if (user.rol === "Gerente") return null;

  if (Array.isArray(user.allowedCampaigns) && user.allowedCampaigns.length > 0) {
    return user.allowedCampaigns;
  }

  if (user.campana) return [user.campana];
  return [];
}

export function filterCampaignsByUser(campaigns, currentUser) {
  if (!currentUser) return [];
  if (currentUser.rol === "Gerente") return campaigns;

  const allowed = getAllowedCampaigns(currentUser);
  if (allowed === null) return campaigns;

  return campaigns.filter((c) => allowed.includes(c.nombre));
}

export function filterUsersByUser(users, currentUser) {
  if (!currentUser) return [];

  if (currentUser.rol === "Gerente") return users;

  if (currentUser.rol === "Admin") {
    const allowed = getAllowedCampaigns(currentUser);
    return users.filter((u) => {
      if (u.rol === "Gerente") return false;
      if (allowed === null) return true;
      if (Array.isArray(u.allowedCampaigns) && u.allowedCampaigns.length > 0) {
        return u.allowedCampaigns.some((c) => allowed.includes(c));
      }
      return !u.campana || allowed.includes(u.campana);
    });
  }

  if (currentUser.rol === "Supervisor") {
    return users.filter(
      (u) =>
        u.nombre === currentUser.nombre ||
        u.coordinador === currentUser.nombre ||
        u.supervisor === currentUser.nombre
    );
  }

  if (currentUser.rol === "Backoffice") {
    const allowed = getAllowedCampaigns(currentUser);
    return users.filter((u) => {
      if (u.nombre === currentUser.nombre) return true;

      if (Array.isArray(u.allowedCampaigns) && u.allowedCampaigns.length > 0) {
        return u.allowedCampaigns.some((c) => allowed.includes(c));
      }

      return allowed.includes(u.campana);
    });
  }

  if (currentUser.rol === "Comercial") {
    return users.filter((u) => u.nombre === currentUser.nombre);
  }

  return [];
}

export function filterVentasByUser(ventas, currentUser) {
  if (!currentUser) return [];

  if (currentUser.rol === "Gerente") return ventas;

  if (currentUser.rol === "Admin") {
    const allowed = getAllowedCampaigns(currentUser);
    if (allowed === null) return ventas;
    return ventas.filter((v) => allowed.includes(v.campana));
  }

  if (currentUser.rol === "Supervisor") {
    return ventas.filter(
      (v) =>
        v.supervisor === currentUser.nombre ||
        v.coordinador === currentUser.nombre
    );
  }

  if (currentUser.rol === "Backoffice") {
    const allowed = getAllowedCampaigns(currentUser);
    if (allowed === null || allowed.length === 0) return ventas;
    return ventas.filter((v) => allowed.includes(v.campana));
  }

  if (currentUser.rol === "Comercial") {
    const allowed = getAllowedCampaigns(currentUser);
    return ventas.filter(
      (v) =>
        v.comercial === currentUser.nombre ||
        allowed.includes(v.campana)
    );
  }

  return [];
}

export function filterLeadsByUser(leads, currentUser) {
  if (!currentUser) return [];

  if (currentUser.rol === "Gerente") return leads;

  const allowed = getAllowedCampaigns(currentUser);
  if (allowed === null) return leads;

  return leads.filter((l) => allowed.includes(l.campana));
}
