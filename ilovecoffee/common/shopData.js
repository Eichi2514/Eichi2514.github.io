/**
 * common/shopData.js
 *
 * 그럴수이치 상점 마스터 데이터
 * - 아이템 정의는 전부 여기서 관리
 * - Firebase에는 유저 상태만 저장
 * - 운영 중 밸런스 조정은 이 파일만 수정
 */

export const SHOP_DATA = {
    /* =====================================================
     * 1. 재화 상자
     * [기본 상자]
        - 10H                  / 브론즈
        - 20H                  / 실버
        - 100H                 / 골드
     * [핫딜 상자]
        - 50H / 60H / 70H      / 브론즈
        - 80H / 90H / 100H     / 실버
        - 500H                 / 골드
     * [스마트 상자]
        - 100H / 120H / 140H   / 브론즈
        - 160H / 180H / 200H   / 실버
        - 1000H                / 골드
     * ===================================================== */
    boxes: {
        SMALL: {
            id: "SMALL", name: "기본 상자", couponCost: 1, averageH: 15.8,
            img: "../image/boxes/SMALL.png",
            rewards: [
                { h: 10, rate: 50 },
                { h: 20, rate: 49 },
                { h: 100, rate: 1 }
            ]
        },

        MEDIUM: {
            id: "MEDIUM", name: "핫딜 상자", couponCost: 5, averageH: 20.98,
            img: "../image/boxes/MEDIUM.png",
            rewards: [
                { h: 50, rate: 15 },
                { h: 60, rate: 15 },
                { h: 70, rate: 16 },
                { h: 80, rate: 16 },
                { h: 90, rate: 16 },
                { h: 100, rate: 15 },
                { h: 500, rate: 7 }
            ]
        },

        LARGE: {
            id: "LARGE", name: "스마트 상자", couponCost: 10, averageH: 27.8,
            img: "../image/boxes/LARGE.png",
            rewards: [
                { h: 100, rate: 14 },
                { h: 120, rate: 14 },
                { h: 140, rate: 14 },
                { h: 160, rate: 14 },
                { h: 180, rate: 14 },
                { h: 200, rate: 15 },
                { h: 1000, rate: 15 }
            ]
        }
    },

    /* =====================================================
     * 2. 어플 테마
     * ===================================================== */
    themes: {
        DEFAULT: {
            id: "DEFAULT", name: "기본", priceH: 0,
            previewColors: [
                "#5a4398",
                "#ede8ff",
                "#3b2d7a"
            ]
        },

        WHITE: {
            id: "WHITE", name: "화이트", priceH: 500,
            previewColors: [
                "#9E9E9E",
                "#EDEDED",
                "#2E2E2E"
            ]
        },

        DARK: {
            id: "DARK", name: "다크", priceH: 500,
            previewColors: [
                "#0A0A0A",
                "#3A3A3A",
                "#000000"
            ]
        },

        SPRING: {
            id: "SPRING", name: "봄", priceH: 2000,
            previewColors: [
                "#E97AA8",
                "#FCE4EF",
                "#B9577E"
            ]
        },
        SUMMER: {
            id: "SUMMER", name: "여름", priceH: 2000,
            previewColors: [
                "#1E88E5",
                "#E3F2FD",
                "#0D47A1"
            ]
        },
        AUTUMN: {
            id: "AUTUMN", name: "가을", priceH: 2000,
            previewColors: [
                "#C65D3A",
                "#F4D3C2",
                "#7A3A2A"
            ]
        },
        WINTER: {
            id: "WINTER", name: "겨울", priceH: 2000,
            previewColors: [
                "#5B6775",
                "#ECEFF3",
                "#2B3442"
            ]
        },

        CHRISTMAS: {
            id: "CHRISTMAS", name: "크리스마스", priceH: 2500,
            previewColors: [
                "#B31904",
                "#F6D6D1",
                "#6FB88A"
            ]
        }
    },

    /* =====================================================
     * 3. 프로필 뱃지
     * ===================================================== */
    badges: {
        NONE: { id: "NONE", name: "뱃지 제거", icon: "", priceH: 0 },

        COFFEE: { id: "COFFEE", name: "커피", icon: "☕", priceH: 200 },
        SPROUT: { id: "SPROUT", name: "새싹", icon: "🌱", priceH: 200 },

        PALETTE: { id: "PALETTE", name: "팔레트", icon: "🎨", priceH: 300 },
        ICECREAM: { id: "ICECREAM", name: "아이스크림", icon: "🍦", priceH: 300 },
        PRETZEL: { id: "PRETZEL", name: "프레첼", icon: "🥨", priceH: 300 },
        HOUSE: { id: "HOUSE", name: "집", icon: "🏠", priceH: 300 },
        THOUGHT: { id: "THOUGHT", name: "생각", icon: "💭", priceH: 300 },
        FORTUNE: { id: "FORTUNE", name: "포춘", icon: "🥠", priceH: 300 },

        HEART: { id: "HEART", name: "하트", icon: "❤️", priceH: 500 },

        FOX: { id: "FOX", name: "여우", icon: "🦊", priceH: 99999 }
    }
};