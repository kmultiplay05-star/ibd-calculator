// IBD Drug Database with pricing and dosing information
// Each drug has both induction (寛解導入期) and maintenance (維持期) dosing
const DRUG_DATABASE = {
    categories: [
        {
            id: '5asa',
            name: '5-ASA製剤',
            icon: '💚',
            cssClass: 'category-5asa',
            drugs: [
                {
                    id: 'mesalazine-pentasa',
                    genericName: 'メサラジン',
                    brandName: 'ペンタサ',
                    indication: ['UC', 'CD'],
                    dosing: {
                        induction: {
                            dose: 4000,
                            unit: 'mg',
                            frequency: '分3-4',
                            interval: 1,
                            description: '1日1500~4000mg 分3'
                        },
                        maintenance: {
                            dose: 2000,
                            unit: 'mg',
                            frequency: '分3',
                            interval: 1,
                            description: '1日1500~2250mg 分3'
                        }
                    },
                    pricing: {
                        formulation: '錠500mg',
                        unitPrice: 51.80,
                        mgPerUnit: 500,
                        daysPerUnit: 1
                    },
                    adjustments: null
                },
                {
                    id: 'mesalazine-lialda',
                    genericName: 'メサラジン',
                    brandName: 'リアルダ',
                    indication: ['UC'],
                    dosing: {
                        induction: {
                            dose: 4800,
                            unit: 'mg',
                            frequency: '1日1回',
                            interval: 1,
                            description: '1日1回 4800mg'
                        },
                        maintenance: {
                            dose: 2400,
                            unit: 'mg',
                            frequency: '1日1回',
                            interval: 1,
                            description: '1日1回 2400mg'
                        }
                    },
                    pricing: {
                        formulation: '錠1200mg',
                        unitPrice: 150.90,
                        mgPerUnit: 1200,
                        daysPerUnit: 1
                    },
                    adjustments: {
                        UC: [
                            {
                                id: 'increase',
                                label: '増量',
                                description: '効果不十分時 4800mgへ増量',
                                multiplier: 2.0
                            }
                        ]
                    }
                }
            ]
        },
        {
            id: 'steroid',
            name: 'ステロイド',
            icon: '🟡',
            cssClass: 'category-steroid',
            drugs: [
                {
                    id: 'prednisolone',
                    genericName: 'プレドニゾロン',
                    brandName: 'プレドニン',
                    indication: ['UC', 'CD'],
                    dosing: {
                        induction: {
                            dosePerKg: 1,
                            maxDose: 60,
                            unit: 'mg',
                            frequency: '1日1回',
                            interval: 1,
                            type: 'weight-based',
                            description: '1mg/kg（最大60mg）'
                        },
                        maintenance: null // 維持療法には使用しない
                    },
                    pricing: {
                        formulation: '錠5mg',
                        unitPrice: 10.10,
                        mgPerUnit: 5,
                        daysPerUnit: 1
                    },
                    adjustments: null
                },
                {
                    id: 'budesonide-zentacort',
                    genericName: 'ブデソニド',
                    brandName: 'ゼンタコート',
                    indication: ['CD'],
                    dosing: {
                        induction: {
                            dose: 9,
                            unit: 'mg',
                            frequency: '1日1回',
                            interval: 1,
                            description: '9mg 1日1回（8週間）'
                        },
                        maintenance: null
                    },
                    pricing: {
                        formulation: 'カプセル3mg',
                        unitPrice: 201.60,
                        unitsPerDose: 3,
                        daysPerUnit: 1
                    },
                    adjustments: null
                },
                {
                    id: 'budesonide-rectabul',
                    genericName: 'ブデソニド',
                    brandName: 'レクタブル',
                    indication: ['UC'],
                    dosing: {
                        induction: {
                            dose: 2,
                            unit: 'mg',
                            frequency: '1日2回',
                            interval: 1,
                            description: '2mg 1日2回'
                        },
                        maintenance: null
                    },
                    pricing: {
                        formulation: '注腸フォーム2mg',
                        unitPrice: 1053.80,
                        unitsPerDose: 2,
                        daysPerUnit: 1
                    },
                    adjustments: null
                }
            ]
        },
        {
            id: 'immunomodulator',
            name: '免疫調節薬',
            icon: '💜',
            cssClass: 'category-immunomodulator',
            drugs: [
                {
                    id: 'azathioprine',
                    genericName: 'アザチオプリン',
                    brandName: 'イムラン/アザニン',
                    indication: ['UC', 'CD'],
                    dosing: {
                        induction: null, // 維持療法が主目的
                        maintenance: {
                            dosePerKg: 1.0,
                            maxDose: 100,
                            unit: 'mg',
                            frequency: '1日1回',
                            interval: 1,
                            type: 'weight-based',
                            description: '0.5~1.0mg/kg 1日1回'
                        }
                    },
                    pricing: {
                        formulation: '錠50mg',
                        unitPrice: 78.80,
                        mgPerUnit: 50,
                        daysPerUnit: 1
                    },
                    adjustments: null
                },
                {
                    id: 'mercaptopurine',
                    genericName: 'メルカプトプリン',
                    brandName: 'ロイケリン',
                    indication: ['UC', 'CD'],
                    dosing: {
                        induction: null,
                        maintenance: {
                            dosePerKg: 0.75,
                            maxDose: 50,
                            unit: 'mg',
                            frequency: '1日1回',
                            interval: 1,
                            type: 'weight-based',
                            description: '0.5~1.0mg/kg 1日1回'
                        }
                    },
                    pricing: {
                        formulation: '錠50mg',
                        unitPrice: 165.40,
                        mgPerUnit: 50,
                        daysPerUnit: 1
                    },
                    adjustments: null
                }
            ]
        },
        {
            id: 'immunosuppressant',
            name: '免疫抑制薬',
            icon: '💗',
            cssClass: 'category-immunosuppressant',
            drugs: [
                {
                    id: 'cyclosporine',
                    genericName: 'シクロスポリン',
                    brandName: 'サンディミュン',
                    indication: ['UC'],
                    dosing: {
                        induction: {
                            dosePerKg: 2,
                            maxDose: 200,
                            unit: 'mg/kg/day',
                            frequency: '持続点滴',
                            interval: 1,
                            type: 'weight-based',
                            description: '2mg/kg/day 持続点滴'
                        },
                        maintenance: null
                    },
                    pricing: {
                        formulation: '注250mg/5mL',
                        unitPrice: 2614.00,
                        mgPerUnit: 250,
                        daysPerUnit: 1
                    },
                    adjustments: null
                },
                {
                    id: 'tacrolimus',
                    genericName: 'タクロリムス',
                    brandName: 'プログラフ',
                    indication: ['UC'],
                    dosing: {
                        induction: {
                            dosePerKg: 0.1,
                            unit: 'mg/kg x2',
                            frequency: '1日2回',
                            interval: 1,
                            type: 'weight-based',
                            description: '0.05mg/kg 1日2回'
                        },
                        maintenance: null
                    },
                    pricing: {
                        formulation: 'カプセル1mg',
                        unitPrice: 372.90,
                        unitsPerDose: 6,
                        daysPerUnit: 1,
                        weightBased: true,
                        dosePerKg: 0.1
                    },
                    adjustments: null
                }
            ]
        },
        {
            id: 'antitnf',
            name: '抗TNFα抗体',
            icon: '💙',
            cssClass: 'category-antitnf',
            drugs: [
                {
                    id: 'infliximab',
                    genericName: 'インフリキシマブ',
                    brandName: 'レミケード',
                    indication: ['UC', 'CD'],
                    dosing: {
                        induction: {
                            dosePerKg: 5,
                            unit: 'mg/kg',
                            frequency: '点滴静注',
                            type: 'weight-based',
                            description: '0・2・6週 5mg/kg 点滴',
                            schedule: [0, 14, 42], // 0,2,6週
                            totalDoses: 3 // 導入期8週で3回
                        },
                        maintenance: {
                            dosePerKg: 5,
                            unit: 'mg/kg',
                            frequency: '点滴静注',
                            interval: 56, // 8週毎
                            type: 'weight-based',
                            description: '8週毎 5mg/kg 点滴'
                        }
                    },
                    pricing: {
                        formulation: '点滴静注用100mg',
                        unitPrice: 51351, // 2025年4月薬価
                        mgPerUnit: 100,
                        isInjection: true
                    },
                    adjustments: {
                        UC: null,
                        CD: [
                            {
                                id: 'shorten',
                                label: '期間短縮',
                                description: '4週毎へ短縮',
                                intervalMultiplier: 0.5
                            },
                            {
                                id: 'increase',
                                label: '10mg/kg増量',
                                description: '10mg/kgへ増量',
                                multiplier: 2.0
                            }
                        ]
                    }
                },
                {
                    id: 'adalimumab',
                    genericName: 'アダリムマブ',
                    brandName: 'ヒュミラ',
                    indication: ['UC', 'CD'],
                    dosing: {
                        induction: {
                            dose: 160,
                            unit: 'mg',
                            frequency: '皮下注',
                            description: '0週160mg・2週80mg・以降40mg隔週',
                            // 8週での必要本数: 160/40=4 + 80/40=2 + 40×3回=3本 = 9本
                            totalUnits: 9
                        },
                        maintenance: {
                            dose: 40,
                            unit: 'mg',
                            frequency: '皮下注',
                            interval: 14,
                            description: '2週毎 40mg 皮下注'
                        }
                    },
                    pricing: {
                        formulation: '皮下注40mgペン0.4mL',
                        unitPrice: 46864, // 2025年4月薬価
                        mgPerUnit: 40,
                        isInjection: true
                    },
                    adjustments: {
                        UC: [
                            {
                                id: 'weekly',
                                label: '毎週投与',
                                description: '40mg毎週投与へ変更',
                                intervalMultiplier: 0.5
                            },
                            {
                                id: 'increase',
                                label: '80mg/2週',
                                description: '80mg隔週へ増量',
                                multiplier: 2.0
                            }
                        ],
                        CD: [
                            {
                                id: 'increase',
                                label: '80mg増量',
                                description: '1回80mgへ増量',
                                multiplier: 2.0
                            }
                        ]
                    }
                },
                {
                    id: 'golimumab',
                    genericName: 'ゴリムマブ',
                    brandName: 'シンポニー',
                    indication: ['UC'],
                    dosing: {
                        induction: {
                            dose: 200,
                            unit: 'mg',
                            frequency: '皮下注',
                            description: '0週200mg・2週100mg・6週100mg',
                            // 8週: 200/50=4 + 100/50=2 + 100/50=2 = 8本
                            totalUnits: 8
                        },
                        maintenance: {
                            dose: 100,
                            unit: 'mg',
                            frequency: '皮下注',
                            interval: 28,
                            description: '4週毎 100mg 皮下注'
                        }
                    },
                    pricing: {
                        formulation: '皮下注50mgシリンジ',
                        unitPrice: 110649, // 2025年4月薬価
                        mgPerUnit: 50,
                        isInjection: true
                    },
                    adjustments: null
                }
            ]
        },
        {
            id: 'antiil',
            name: '抗インターロイキン抗体',
            icon: '🩵',
            cssClass: 'category-antiil',
            drugs: [
                {
                    id: 'ustekinumab',
                    genericName: 'ウステキヌマブ',
                    brandName: 'ステラーラ',
                    indication: ['UC', 'CD'],
                    dosing: {
                        induction: {
                            type: 'weight-based',
                            frequency: '点滴+皮下注',
                            description: '初回点滴(体重帯)+8週後皮下90mg',
                            // 点滴: ≥55kg=260mg(2瓶), 55-85kg=390mg(3瓶), >85kg=520mg(4瓶)
                            // + 皮下45mg×2
                            ivPrice130mg: 184085,
                            scPrice45mg: 198887,
                            totalDoses: 1 // 導入期点滴1回 + 皮下1回
                        },
                        maintenance: {
                            dose: 90,
                            unit: 'mg',
                            frequency: '皮下注',
                            interval: 56, // 8週毎
                            description: '8週毎 90mg 皮下注'
                        }
                    },
                    pricing: {
                        formulation: '皮下注45mgシリンジ',
                        unitPrice: 198887, // 2025年4月薬価
                        mgPerUnit: 45,
                        ivUnitPrice: 184085, // 130mg瓶
                        ivMgPerUnit: 130,
                        isInjection: true
                    },
                    adjustments: {
                        UC: [
                            {
                                id: 'shorten',
                                label: '8週毎へ短縮',
                                description: '12週毎から8週毎へ短縮',
                                intervalMultiplier: 0.667
                            }
                        ],
                        CD: [
                            {
                                id: 'shorten',
                                label: '8週毎へ短縮',
                                description: '12週毎から8週毎へ短縮',
                                intervalMultiplier: 0.667
                            }
                        ]
                    }
                },
                {
                    id: 'risankizumab',
                    genericName: 'リサンキズマブ',
                    brandName: 'スキリージ',
                    indication: ['UC', 'CD'],
                    dosing: {
                        induction: {
                            dose: 1200, // UC: 1200mg (600mg×2瓶×3回=6瓶)
                            unit: 'mg',
                            frequency: '点滴',
                            description: 'UC: 0・4・8週 1200mg点滴',
                            totalUnits: 6 // 600mg×2 × 3回 = 6瓶
                        },
                        maintenance: {
                            dose: 180,
                            unit: 'mg',
                            frequency: '皮下注',
                            interval: 56, // 8週毎
                            description: '8週毎 180mgまたは360mg 皮下注'
                        }
                    },
                    pricing: {
                        formulation: '点滴静注600mg',
                        unitPrice: 190369, // 2025年4月薬価 (600mg瓶)
                        mgPerUnit: 600,
                        scUnitPrice: 259358, // 皮下注180mg
                        scMgPerUnit: 180,
                        isInjection: true
                    },
                    adjustments: {
                        UC: [
                            {
                                id: 'increase',
                                label: '360mg増量',
                                description: '180mgから360mgへ増量',
                                multiplier: 2.0
                            }
                        ],
                        CD: [
                            {
                                id: 'rescue',
                                label: '追加点滴',
                                description: '効果減弱時に1200mg点滴追加',
                                additionalCostPerMonth: 519716
                            }
                        ]
                    }
                },
                {
                    id: 'mirikizumab',
                    genericName: 'ミリキズマブ',
                    brandName: 'オンボー',
                    indication: ['UC'],
                    dosing: {
                        induction: {
                            dose: 300,
                            unit: 'mg',
                            frequency: '点滴',
                            description: '0・4・8週 300mg 点滴',
                            totalUnits: 3 // 300mg瓶 × 3回 = 3瓶
                        },
                        maintenance: {
                            dose: 200,
                            unit: 'mg',
                            frequency: '皮下注',
                            interval: 28, // 4週毎
                            description: '4週毎 200mg 皮下注'
                        }
                    },
                    pricing: {
                        formulation: '点滴静注300mg',
                        unitPrice: 189785, // 2025年4月薬価 (300mg瓶)
                        mgPerUnit: 300,
                        scUnitPrice: 125123, // 皮下注100mg AI
                        scMgPerUnit: 100,
                        isInjection: true
                    },
                    adjustments: null
                }
            ]
        },
        {
            id: 'antiintegrin',
            name: '抗インテグリン抗体',
            icon: '💎',
            cssClass: 'category-antiintegrin',
            drugs: [
                {
                    id: 'vedolizumab',
                    genericName: 'ベドリズマブ',
                    brandName: 'エンタイビオ',
                    indication: ['UC', 'CD'],
                    dosing: {
                        induction: {
                            dose: 300,
                            unit: 'mg',
                            frequency: '点滴静注',
                            description: '0・2・6週 300mg 点滴',
                            totalUnits: 3 // 300mg瓶 × 3回 = 3瓶
                        },
                        maintenance: {
                            dose: 300,
                            unit: 'mg',
                            frequency: '点滴静注',
                            interval: 56, // 8週毎
                            description: '8週毎 300mg 点滴'
                        }
                    },
                    pricing: {
                        formulation: '点滴静注用300mg',
                        unitPrice: 279573, // 2025年4月薬価
                        mgPerUnit: 300,
                        scUnitPrice: 69888, // 皮下注108mg
                        scMgPerUnit: 108,
                        isInjection: true
                    },
                    adjustments: null
                }
            ]
        },
        {
            id: 'jak',
            name: 'JAK阻害薬',
            icon: '❤️',
            cssClass: 'category-jak',
            drugs: [
                {
                    id: 'tofacitinib',
                    genericName: 'トファシチニブ',
                    brandName: 'ゼルヤンツ',
                    indication: ['UC'],
                    dosing: {
                        induction: {
                            dose: 20, // 10mg x 2回 = 4錠/日
                            unit: 'mg',
                            frequency: '1日2回',
                            interval: 1,
                            description: '1日2回 10mg (8週)',
                            tabletsPerDay: 4 // 5mg錠 × 4
                        },
                        maintenance: {
                            dose: 10, // 5mg x 2回 = 2錠/日
                            unit: 'mg',
                            frequency: '1日2回',
                            interval: 1,
                            description: '1日2回 5mg',
                            tabletsPerDay: 2
                        }
                    },
                    pricing: {
                        formulation: '錠5mg',
                        unitPrice: 2260.90, // 2025年4月薬価
                        mgPerUnit: 5,
                        daysPerUnit: 1
                    },
                    adjustments: {
                        UC: [
                            {
                                id: 'increase',
                                label: '10mg×2増量',
                                description: '効果不十分時 1日2回10mgへ増量',
                                multiplier: 2.0
                            }
                        ]
                    }
                },
                {
                    id: 'filgotinib',
                    genericName: 'フィルゴチニブ',
                    brandName: 'ジセレカ',
                    indication: ['UC'],
                    dosing: {
                        induction: {
                            dose: 200,
                            unit: 'mg',
                            frequency: '1日1回',
                            interval: 1,
                            description: '1日1回 200mg (8週)',
                            tabletsPerDay: 1
                        },
                        maintenance: {
                            dose: 200,
                            unit: 'mg',
                            frequency: '1日1回',
                            interval: 1,
                            description: '1日1回 200mgまたは100mg',
                            tabletsPerDay: 1
                        }
                    },
                    pricing: {
                        formulation: '錠200mg',
                        unitPrice: 4159.60, // 2025年4月薬価
                        mgPerUnit: 200,
                        daysPerUnit: 1
                    },
                    adjustments: {
                        UC: [
                            {
                                id: 'decrease',
                                label: '100mg減量',
                                description: '症状に応じ100mgへ減量',
                                multiplier: 0.5
                            }
                        ]
                    }
                },
                {
                    id: 'upadacitinib',
                    genericName: 'ウパダシチニブ',
                    brandName: 'リンヴォック',
                    indication: ['UC', 'CD'],
                    dosing: {
                        induction: {
                            dose: 45,
                            unit: 'mg',
                            frequency: '1日1回',
                            interval: 1,
                            description: '1日1回 45mg (8週)',
                            tabletsPerDay: 1
                        },
                        maintenance: {
                            dose: 15,
                            unit: 'mg',
                            frequency: '1日1回',
                            interval: 1,
                            description: '1日1回 15mgまたは30mg',
                            tabletsPerDay: 1
                        }
                    },
                    pricing: {
                        formulation: '錡45mg',
                        unitPrice: 8226, // 2025年4月薬価 (45mg錠)
                        mgPerUnit: 45,
                        price15mg: 4325.8, // 15mg錠
                        price30mg: 6628, // 30mg錠
                        daysPerUnit: 1
                    },
                    adjustments: {
                        UC: [
                            {
                                id: 'increase',
                                label: '30mg増量',
                                description: '重症度に応じ30mgへ増量',
                                multiplier: 2.0,
                                priceMultiplier: 1.53 // 6628/4325.8
                            }
                        ],
                        CD: [
                            {
                                id: 'increase',
                                label: '30mg増量',
                                description: '重症度に応じ30mgへ増量',
                                multiplier: 2.0,
                                priceMultiplier: 1.53
                            }
                        ]
                    }
                }
            ]
        },
        {
            id: 's1p',
            name: 'S1P受容体調節薬',
            icon: '🧡',
            cssClass: 'category-s1p',
            drugs: [
                {
                    id: 'ozanimod',
                    genericName: 'オザニモド',
                    brandName: 'ゼポシア',
                    indication: ['UC'],
                    dosing: {
                        induction: {
                            dose: 0.92,
                            unit: 'mg',
                            frequency: '1日1回',
                            interval: 1,
                            description: '7日間段階増量後 0.92mg'
                        },
                        maintenance: {
                            dose: 0.92,
                            unit: 'mg',
                            frequency: '1日1回',
                            interval: 1,
                            description: '1日1回 0.92mg'
                        }
                    },
                    pricing: {
                        formulation: 'カプセル0.92mg',
                        unitPrice: 4792.80,
                        unitsPerDose: 1,
                        daysPerUnit: 1
                    },
                    adjustments: null
                }
            ]
        }
    ]
};

// Export for use in app.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DRUG_DATABASE;
}
