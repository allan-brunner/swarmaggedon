import { TEAM } from './world.js';
import { createBullet, BULLET_EXPLOS } from './bullet.js';

export const SPECIALIZATION = {
    ASSASSIN: 'assassin',
    FIRE_WIZARD: 'fire_wizard',
    ELECTRIC_WIZARD: 'electric_wizard',
    SALAMANDER: 'salamander',
};

export const SPECIALIZATION_DEFS = {
    [SPECIALIZATION.ASSASSIN]: {
        id: SPECIALIZATION.ASSASSIN,
        name: 'Assassin',
        icon: '🥷',
        color: '#5a4b81',
        description: 'A shadow clone stalks the nearest enemy and strikes from behind for heavy damage.',
        props: ['cooldown', 'damage'],
        baseState: {
            cooldown: 3.2,
            cooldownTime: 0,
            damage: 55,
            windup: 0.35,
        },
    },
    [SPECIALIZATION.FIRE_WIZARD]: {
        id: SPECIALIZATION.FIRE_WIZARD,
        name: 'Fire Wizard',
        icon: '🔥',
        color: '#c0392b',
        description: 'Hurls a fireball that explodes and leaves enemies burning over time.',
        props: ['cooldown', 'damage', 'burnDps'],
        baseState: {
            cooldown: 2.2,
            cooldownTime: 0,
            damage: 22,
            burnDps: 6,
            burnDuration: 3,
            aoeRadius: 70,
            bulletSpeed: 400,
            range: 480,
        },
    },
    [SPECIALIZATION.ELECTRIC_WIZARD]: {
        id: SPECIALIZATION.ELECTRIC_WIZARD,
        name: 'Electric Wizard',
        icon: '⚡',
        color: '#f1c40f',
        description: 'Calls down lightning that strikes random enemies near you.',
        props: ['cooldown', 'damage', 'strikes'],
        baseState: {
            cooldown: 1.8,
            cooldownTime: 0,
            damage: 26,
            strikes: 2,
            radius: 260,
        },
    },
    [SPECIALIZATION.SALAMANDER]: {
        id: SPECIALIZATION.SALAMANDER,
        name: 'Salamander',
        icon: '🦎',
        color: '#27ae60',
        description: 'Floods the ground under an enemy with a poison lake that lingers and damages over time.',
        props: ['cooldown', 'radius', 'dps'],
        baseState: {
            cooldown: 5,
            cooldownTime: 0,
            radius: 90,
            dps: 10,
            duration: 4,
        },
    },
};

export function createSpecialization(id) {
    const def = SPECIALIZATION_DEFS[id];
    return { id, ...def.baseState, fx: [] };
}

export function updateSpecialization(actor, dt, world) {
    const spec = actor.specialization;
    if (!spec) return;

    _tickFx(spec, dt, world);

    spec.cooldownTime -= Math.min(dt, spec.cooldownTime);
    if (spec.cooldownTime > 0) return;

    const target = world.nearestActor(actor.x, actor.y, TEAM.ENEMY);
    if (!target && spec.id !== SPECIALIZATION.ELECTRIC_WIZARD) return;

    switch (spec.id) {
        case SPECIALIZATION.ASSASSIN: _fireAssassin(spec, target); break;
        case SPECIALIZATION.FIRE_WIZARD: _fireFireball(spec, actor, target, world); break;
        case SPECIALIZATION.ELECTRIC_WIZARD: _fireLightning(spec, actor, world); break;
        case SPECIALIZATION.SALAMANDER: _fireLake(spec, target); break;
        default: return;
    }

    spec.cooldownTime = spec.cooldown;
}

function _tickFx(spec, dt, world) {
    for (let i = spec.fx.length - 1; i >= 0; i--) {
        const fx = spec.fx[i];
        fx.time += dt;

        if (fx.type === 'clone') _tickClone(fx, world);
        else if (fx.type === 'lake') _tickLake(fx, dt, world);
        else if (fx.type === 'bolt' && fx.time > 0.3) fx.dead = true;

        if (fx.dead) spec.fx.splice(i, 1);
    }
}

// ── Assassin ──────────────────────────────────────────────
function _fireAssassin(spec, target) {
    if (!target) return;
    const behindAngle = (target.angle ?? 0) + Math.PI;
    const spawnDist = target.radius + 24;
    spec.fx.push({
        type: 'clone',
        time: 0,
        windup: spec.windup ?? 0.35,
        x: target.x + Math.cos(behindAngle) * spawnDist,
        y: target.y + Math.sin(behindAngle) * spawnDist,
        targetRef: target,
        damage: spec.damage,
        struck: false,
        dead: false,
    });
}

function _tickClone(fx, world) {
    const target = fx.targetRef;
    if (!target || target.hp <= 0 || target.dead) { fx.dead = true; return; }

    if (!fx.struck) {
        const behindAngle = (target.angle ?? 0) + Math.PI;
        const spawnDist = target.radius + 24;
        fx.x = target.x + Math.cos(behindAngle) * spawnDist;
        fx.y = target.y + Math.sin(behindAngle) * spawnDist;

        if (fx.time < fx.windup) return;

        target.takeDamage(fx.damage, null, world);
        fx.struck = true;
        return;
    }

    if (fx.time > fx.windup + 0.3) fx.dead = true;
}

// ── Fire Wizard ───────────────────────────────────────────
function _fireFireball(spec, actor, target, world) {
    const angle = Math.atan2(target.y - actor.y, target.x - actor.x);
    const bullet = createBullet(
        actor.x, actor.y, 6, angle, spec.bulletSpeed, spec.damage, spec.range,
        BULLET_EXPLOS.AOE,
        { aoeRadius: spec.aoeRadius, burnDps: spec.burnDps, burnDuration: spec.burnDuration },
        actor.team,
    );
    bullet.color = '#e67e22';
    world.spawnActor(bullet);
}

// ── Electric Wizard ───────────────────────────────────────
function _fireLightning(spec, actor, world) {
    const targets = world.actorsinRadius(actor.x, actor.y, spec.radius, TEAM.ENEMY)
        .sort(() => 0.5 - Math.random())
        .slice(0, spec.strikes);

    for (const t of targets) {
        t.takeDamage(spec.damage, null, world);
        spec.fx.push({ type: 'bolt', time: 0, x: t.x, y: t.y, dead: false });
    }
}

// ── Salamander ────────────────────────────────────────────
function _fireLake(spec, target) {
    if (!target) return;
    spec.fx.push({
        type: 'lake',
        time: 0,
        tickTimer: 0,
        x: target.x, y: target.y,
        radius: spec.radius, dps: spec.dps, duration: spec.duration,
        dead: false,
    });
}

function _tickLake(fx, dt, world) {
    if (fx.time >= fx.duration) { fx.dead = true; return; }
    fx.tickTimer -= dt;
    if (fx.tickTimer <= 0) {
        fx.tickTimer = 0.5;
        for (const t of world.actorsinRadius(fx.x, fx.y, fx.radius, TEAM.ENEMY)) {
            t.takeDamage(fx.dps * 0.5, null, world);
        }
    }
}

export function drawSpecializationGroundFx(ctx, actor) {
    const spec = actor.specialization;
    if (!spec) return;
    for (const fx of spec.fx) {
        if (fx.type === 'lake') _drawLake(ctx, fx);
    }
}

export function drawSpecializationImpactFx(ctx, actor) {
    const spec = actor.specialization;
    if (!spec) return;
    for (const fx of spec.fx) {
        if (fx.type === 'clone') _drawClone(ctx, fx);
        else if (fx.type === 'bolt') _drawBolt(ctx, fx);
    }
}

function _drawClone(ctx, fx) {
    const windupT = Math.min(1, fx.time / fx.windup);
    ctx.save();
    ctx.translate(fx.x, fx.y);

    if (!fx.struck) {
        ctx.globalAlpha = windupT * 0.9;
        ctx.fillStyle = '#2a2318';
        ctx.beginPath();
        ctx.ellipse(0, 0, 11, 11, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.globalAlpha = (1 - windupT) * 0.6;
        ctx.strokeStyle = '#8e44ad';
        ctx.lineWidth = 1.5;
        ctx.setLineDash([3, 4]);
        ctx.beginPath();
        ctx.arc(0, 0, 18 - windupT * 6, 0, Math.PI * 2);
        ctx.stroke();
    } else {
        const strikeT = Math.min(1, (fx.time - fx.windup) / 0.3);
        ctx.globalAlpha = Math.max(0, 1 - strikeT) * 0.85;
        ctx.fillStyle = '#2a2318';
        ctx.beginPath();
        ctx.ellipse(0, 0, 11, 11, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.globalAlpha = Math.max(0, 1 - strikeT * 1.4);
        ctx.strokeStyle = '#e74c3c';
        ctx.lineWidth = 2.5;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(-12, -12);
        ctx.lineTo(12, 12);
        ctx.stroke();
    }
    ctx.restore();
}

function _drawBolt(ctx, fx) {
    const alpha = Math.max(0, 1 - fx.time / 0.3);
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.strokeStyle = '#f1c40f';
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';

    ctx.beginPath();
    let x = fx.x, y = fx.y - 420;
    ctx.moveTo(x, y);
    while (y < fx.y) {
        x += (Math.random() - 0.5) * 26;
        y += 30;
        ctx.lineTo(x, Math.min(y, fx.y));
    }
    ctx.stroke();

    ctx.globalAlpha = alpha * 0.35;
    ctx.fillStyle = '#f1c40f';
    ctx.beginPath();
    ctx.arc(fx.x, fx.y, 22, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
}

function _drawLake(ctx, fx) {
    const remaining = Math.max(0, fx.duration - fx.time);
    const alpha = 0.15 + Math.min(1, remaining / fx.duration) * 0.45;
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.fillStyle = '#27ae60';
    ctx.beginPath();
    ctx.ellipse(fx.x, fx.y, fx.radius, fx.radius * 0.55, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.globalAlpha = alpha * 1.3;
    ctx.strokeStyle = '#1e8449';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([4, 5]);
    ctx.beginPath();
    ctx.ellipse(fx.x, fx.y, fx.radius, fx.radius * 0.55, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);

    const pulse = (Math.sin(Date.now() / 220 + fx.x) + 1) / 2;
    ctx.globalAlpha = alpha * 0.5 * pulse;
    ctx.fillStyle = '#27ae60';
    ctx.beginPath();
    ctx.ellipse(fx.x, fx.y, fx.radius * 0.4, fx.radius * 0.22, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
}