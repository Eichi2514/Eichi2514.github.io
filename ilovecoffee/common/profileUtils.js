// common/profileUtils.js
import { PROFILE_GROUPS } from "./profileData.js";

const DEFAULT_PROFILE = {
    id: 1,
    name: "기본 프로필",
    src: "../image/profile1.jpg"
};

const ALL_PROFILES = Object.values(PROFILE_GROUPS).flat();

/**
 * ✅ 절대 null 반환하지 않음
 */
export function getSafeProfileById(id) {
    const numId = Number(id);
    if (!numId) return DEFAULT_PROFILE;

    const found = ALL_PROFILES.find(p => p.id === numId);
    return found ?? DEFAULT_PROFILE;
}

export function getProfileImageSrc(id) {
    return getSafeProfileById(id).src;
}

export function getProfileName(id) {
    return getSafeProfileById(id).name;
}

export function getProfileGroup(id) {
    const numId = Number(id);

    if (numId >= 1 && numId <= 19) return "favorite";
    if (numId >= 101 && numId <= 199) return "normal";
    if (numId >= 91 && numId <= 99) return "rank";
    if (numId === 100) return "admin";
    return "unknown";
}