import re

def patch_file(filepath, replacements):
    with open(filepath, 'r') as f:
        content = f.read()
    
    original = content
    for target, replacement in replacements:
        content = content.replace(target, replacement)
    
    if content != original:
        with open(filepath, 'w') as f:
            f.write(content)
        print(f"Successfully patched {filepath}")
    else:
        print(f"No changes made to {filepath} (target not found)")

# 1. TacticalIdentity.tsx
patch_file("src/components/ui/TacticalIdentity.tsx", [
    ("opsHistory.map(op =>", "opsHistory.map((op: string) =>")
])

# 2. App.tsx
patch_file("src/App.tsx", [
    ('if (user.role === "ADMIN") return ["dashboard", "live", "tracking", "analysis", "alerts", "health", "settings"];',
     'if (user.role === "COMMANDER") return ["dashboard", "live", "tracking", "analysis", "alerts", "health", "settings"];'),
    ('if (user.role === "OPERATOR") return ["dashboard", "live", "tracking"];',
     'if (user.role === "STRATEGIC_OPS" || user.role === "ANALYST") return ["dashboard", "live", "tracking", "analysis", "alerts"];\n    if (user.role === "FIELD_CONTROL") return ["dashboard", "live", "tracking"];'),
    ('role={user.role}', 'role={user.role}')
])

# 3. DashboardLayout.tsx
patch_file("src/components/layout/DashboardLayout.tsx", [
    ('role: "ADMIN" | "OPERATOR" | "VIEWER";', 'role: Role;'),
    ('import { motion, AnimatePresence } from "framer-motion";', 'import { motion, AnimatePresence } from "framer-motion";\nimport type { Role } from "../../context/AuthContext";'),
    ('import { motion, AnimatePresence } from "framer-motion";\nimport { Role } from "../../context/AuthContext";', 'import { motion, AnimatePresence } from "framer-motion";\nimport type { Role } from "../../context/AuthContext";')
])

# 4. TopNav.tsx
patch_file("src/components/layout/TopNav.tsx", [
    ('role }: { role: "ADMIN" | "OPERATOR" | "VIEWER" }', 'role }: { role: Role }'),
    ('import { Bell, Shield, Circle, Settings, Activity, Command, Zap } from "lucide-react";', 
     'import { Bell, Shield, Circle, Settings, Activity, Command, Zap } from "lucide-react";\nimport type { Role } from "../../context/AuthContext";'),
    ('import { Bell, Shield, Circle, Settings, Activity, Command, Zap } from "lucide-react";\nimport { Role } from "../../context/AuthContext";',
     'import { Bell, Shield, Circle, Settings, Activity, Command, Zap } from "lucide-react";\nimport type { Role } from "../../context/AuthContext";')
])

# 5. Sidebar.tsx
patch_file("src/components/layout/Sidebar.tsx", [
    ('role,', 'role,'),
    ('role: "ADMIN" | "OPERATOR" | "VIEWER";', 'role: Role;'),
    ('const roleAccess: Record<"ADMIN" | "OPERATOR" | "VIEWER", string[]> = {', 'const roleAccess: Record<Role, string[]> = {'),
    ('ADMIN: ["dashboard", "live", "tracking", "analysis", "alerts", "health", "settings"],\n  OPERATOR: ["dashboard", "live", "tracking"],\n  VIEWER: ["dashboard"],',
     'COMMANDER: ["dashboard", "live", "tracking", "analysis", "alerts", "health", "settings"],\n  STRATEGIC_OPS: ["dashboard", "live", "tracking", "analysis", "alerts"],\n  FIELD_CONTROL: ["dashboard", "live", "tracking"],\n  ANALYST: ["dashboard", "live", "tracking", "analysis", "alerts"],\n  OBSERVER: ["dashboard"],'),
    ('ease: [0.22, 1, 0.36, 1],', 'ease: [0.22, 1, 0.36, 1] as const,'),
    ('ease: "easeOut"', 'ease: "easeOut" as const'),
    ('import { useAuth } from "../../context/AuthContext";', 'import { useAuth } from "../../context/AuthContext";\nimport type { Role } from "../../context/AuthContext";')
])

# 6. AIConfidenceChart.tsx
patch_file("src/components/ui/AIConfidenceChart.tsx", [
    ('''              grid: {
                color: "rgba(255, 255, 255, 0.05)",
                drawBorder: false,
              },''',
     '''              grid: {
                color: "rgba(255, 255, 255, 0.05)",
              },
              border: {
                display: false,
              },''')
])

# 7. StatCard.tsx
patch_file("src/components/ui/StatCard.tsx", [
    ('import { ReactNode, useEffect } from "react";',
     'import type { ReactNode } from "react";\nimport { useEffect } from "react";')
])

# 8. Dashboard.tsx
patch_file("src/pages/Dashboard.tsx", [
    ('ease: [0.22, 1, 0.36, 1]', 'ease: [0.22, 1, 0.36, 1] as const')
])

# 9. Landing.tsx
patch_file("src/pages/Landing.tsx", [
    ('ease: [0.22, 1, 0.36, 1]', 'ease: [0.22, 1, 0.36, 1] as const')
])

# 10. LiveDetection.tsx
patch_file("src/pages/LiveDetection.tsx", [
    ('ease: [0.22, 1, 0.36, 1]', 'ease: [0.22, 1, 0.36, 1] as const')
])

# 11. Login.tsx
patch_file("src/pages/Login.tsx", [
    ('Speaker, Mic, Target, ShieldCheck, MapPin, Radio, Wifi, LockKeyhole',
     'Speaker, Mic, Target, ShieldCheck, MapPin, Radio, Wifi, LockKeyhole, Brain, User')
])
