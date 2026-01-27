// IBD Drug Database with pricing and dosing information
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
                        type: 'fixed', // fixed, weight-based
                        standard: {
                            dose: 4000, // mg/day
                            unit: 'mg',
                            frequency: '分3-4',
                            interval: 1 // days
                        }
                    },
                    pricing: {
                        formulation: '錠500mg',
                        unitPrice: 51.80,
                        unitsPerDose: 8, // 4000mg = 500mg x 8錠
                        daysPerUnit: 1
                    }
                },
                {
                    id: 'mesalazine-asacol',
                    genericName: 'メサラジン',
                    brandName: 'アサコール',
                    indication: ['UC'],
                    dosing: {
                        type: 'fixed',
                        standard: {
                            dose: 3600, // mg/day
                            unit: 'mg',
                            frequency: '分3',
                            interval: 1
                        }
                    },
                    pricing: {
                        formulation: '錠400mg',
                        unitPrice: 45.20,
                        unitsPerDose: 9,
                        daysPerUnit: 1
                    }
                },
                {
                    id: 'mesalazine-lialda',
                    genericName: 'メサラジン',
                    brandName: 'リアルダ',
                    indication: ['UC'],
                    dosing: {
                        type: 'fixed',
                        standard: {
                            dose: 4800,
                            unit: 'mg',
                            frequency: '1日1回',
                            interval: 1
                        }
                    },
                    pricing: {
                        formulation: '錠1200mg',
                        unitPrice: 150.90,
                        unitsPerDose: 4,
                        daysPerUnit: 1
                    }
                },
                {
                    id: 'sulfasalazine',
                    genericName: 'サラゾスルファピリジン',
                    brandName: 'サラゾピリン',
                    indication: ['UC', 'CD'],
                    dosing: {
                        type: 'fixed',
                        standard: {
                            dose: 4000,
                            unit: 'mg',
                            frequency: '分4',
                            interval: 1
                        }
                    },
                    pricing: {
                        formulation: '錠500mg',
                        unitPrice: 12.50,
                        unitsPerDose: 8,
                        daysPerUnit: 1
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
                        type: 'weight-based',
                        standard: {
                            dosePerKg: 1, // mg/kg/day
                            maxDose: 60,
                            unit: 'mg',
                            frequency: '1日1回',
                            interval: 1
                        }
                    },
                    pricing: {
                        formulation: '錠5mg',
                        unitPrice: 10.10,
                        mgPerUnit: 5,
                        daysPerUnit: 1
                    }
                },
                {
                    id: 'budesonide-zentacort',
                    genericName: 'ブデソニド',
                    brandName: 'ゼンタコート',
                    indication: ['CD'],
                    dosing: {
                        type: 'fixed',
                        standard: {
                            dose: 9,
                            unit: 'mg',
                            frequency: '1日1回',
                            interval: 1
                        }
                    },
                    pricing: {
                        formulation: 'カプセル3mg',
                        unitPrice: 201.60,
                        unitsPerDose: 3,
                        daysPerUnit: 1
                    }
                },
                {
                    id: 'budesonide-rectabul',
                    genericName: 'ブデソニド',
                    brandName: 'レクタブル',
                    indication: ['UC'],
                    dosing: {
                        type: 'fixed',
                        standard: {
                            dose: 2,
                            unit: 'mg',
                            frequency: '1日2回',
                            interval: 1
                        }
                    },
                    pricing: {
                        formulation: '注腸フォーム2mg',
                        unitPrice: 1053.80,
                        unitsPerDose: 2,
                        daysPerUnit: 1
                    }
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
                        type: 'weight-based',
                        standard: {
                            dosePerKg: 1.5,
                            maxDose: 100,
                            unit: 'mg',
                            frequency: '1日1回',
                            interval: 1
                        }
                    },
                    pricing: {
                        formulation: '錠50mg',
                        unitPrice: 78.80,
                        mgPerUnit: 50,
                        daysPerUnit: 1
                    }
                },
                {
                    id: 'mercaptopurine',
                    genericName: 'メルカプトプリン',
                    brandName: 'ロイケリン',
                    indication: ['UC', 'CD'],
                    dosing: {
                        type: 'weight-based',
                        standard: {
                            dosePerKg: 0.75,
                            maxDose: 50,
                            unit: 'mg',
                            frequency: '1日1回',
                            interval: 1
                        }
                    },
                    pricing: {
                        formulation: '錠50mg',
                        unitPrice: 165.40,
                        mgPerUnit: 50,
                        daysPerUnit: 1
                    }
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
                        type: 'weight-based',
                        standard: {
                            dosePerKg: 2,
                            maxDose: 200,
                            unit: 'mg/kg/day',
                            frequency: '持続点滴',
                            interval: 1
                        }
                    },
                    pricing: {
                        formulation: '注250mg/5mL',
                        unitPrice: 2614.00,
                        mgPerUnit: 250,
                        daysPerUnit: 1
                    }
                },
                {
                    id: 'tacrolimus',
                    genericName: 'タクロリムス',
                    brandName: 'プログラフ',
                    indication: ['UC'],
                    dosing: {
                        type: 'fixed',
                        standard: {
                            dose: 0.1,
                            unit: 'mg/kg x2',
                            frequency: '1日2回',
                            interval: 1
                        }
                    },
                    pricing: {
                        formulation: 'カプセル1mg',
                        unitPrice: 372.90,
                        unitsPerDose: 6, // 60kgで約3mg x 2回 = 6カプセル
                        daysPerUnit: 1,
                        weightBased: true,
                        dosePerKg: 0.1 // mg/kg/dose x 2回
                    }
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
                        type: 'weight-based',
                        standard: {
                            dosePerKg: 5,
                            unit: 'mg/kg',
                            frequency: '点滴静注',
                            interval: 56, // 8週間
                            inductionSchedule: [0, 14, 42] // 0, 2, 6週
                        }
                    },
                    pricing: {
                        formulation: '点滴静注用100mg',
                        unitPrice: 54950,
                        mgPerUnit: 100,
                        isInjection: true
                    }
                },
                {
                    id: 'adalimumab',
                    genericName: 'アダリムマブ',
                    brandName: 'ヒュミラ',
                    indication: ['UC', 'CD'],
                    dosing: {
                        type: 'fixed',
                        standard: {
                            dose: 40,
                            unit: 'mg',
                            frequency: '皮下注',
                            interval: 14 // 2週間
                        }
                    },
                    pricing: {
                        formulation: '皮下注40mgペン0.4mL',
                        unitPrice: 51022,
                        unitsPerDose: 1,
                        isInjection: true
                    }
                },
                {
                    id: 'golimumab',
                    genericName: 'ゴリムマブ',
                    brandName: 'シンポニー',
                    indication: ['UC'],
                    dosing: {
                        type: 'fixed',
                        standard: {
                            dose: 100,
                            unit: 'mg',
                            frequency: '皮下注',
                            interval: 28 // 4週間
                        }
                    },
                    pricing: {
                        formulation: '皮下注50mgシリンジ',
                        unitPrice: 110649,
                        unitsPerDose: 2, // 100mg = 50mg x 2本
                        isInjection: true
                    }
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
                        type: 'weight-based',
                        standard: {
                            // 初回: 体重に応じて260mg/390mg/520mg静注
                            // 維持: 90mg皮下注 12週ごと
                            dosePerKg: 6, // 約6mg/kg 初回
                            unit: 'mg',
                            frequency: '皮下注(維持)',
                            interval: 84, // 12週間
                            maintenanceDose: 90
                        }
                    },
                    pricing: {
                        formulation: '皮下注45mgシリンジ',
                        unitPrice: 198887, // 2025年薬価
                        unitsPerDose: 2, // 90mg = 45mg x 2本
                        isInjection: true
                    }
                },
                {
                    id: 'risankizumab',
                    genericName: 'リサンキズマブ',
                    brandName: 'スキリージ',
                    indication: ['UC', 'CD'],
                    dosing: {
                        type: 'fixed',
                        standard: {
                            // 導入: 600mg 0,4,8週
                            // 維持: 360mg 8週ごと (UC), 180/360mg (CD)
                            dose: 360,
                            unit: 'mg',
                            frequency: '皮下注(維持)',
                            interval: 56 // 8週間
                        }
                    },
                    pricing: {
                        formulation: '皮下注180mgオートドーザー',
                        unitPrice: 259358,
                        unitsPerDose: 2, // 360mg = 180mg x 2
                        isInjection: true
                    }
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
                        type: 'fixed',
                        standard: {
                            // 点滴: 300mg 0,2,6週、以後8週ごと
                            dose: 300,
                            unit: 'mg',
                            frequency: '点滴静注',
                            interval: 56 // 8週間
                        }
                    },
                    pricing: {
                        formulation: '点滴静注用300mg',
                        unitPrice: 279573,
                        unitsPerDose: 1,
                        isInjection: true
                    }
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
                        type: 'fixed',
                        standard: {
                            dose: 10, // 維持期は5mg x 2
                            unit: 'mg',
                            frequency: '1日2回',
                            interval: 1
                        }
                    },
                    pricing: {
                        formulation: '錠5mg',
                        unitPrice: 2260.90,
                        unitsPerDose: 2, // 5mg x 2錠
                        daysPerUnit: 1
                    }
                },
                {
                    id: 'filgotinib',
                    genericName: 'フィルゴチニブ',
                    brandName: 'ジセレカ',
                    indication: ['UC'],
                    dosing: {
                        type: 'fixed',
                        standard: {
                            dose: 200,
                            unit: 'mg',
                            frequency: '1日1回',
                            interval: 1
                        }
                    },
                    pricing: {
                        formulation: '錠200mg',
                        unitPrice: 4159.60,
                        unitsPerDose: 1,
                        daysPerUnit: 1
                    }
                },
                {
                    id: 'upadacitinib',
                    genericName: 'ウパダシチニブ',
                    brandName: 'リンヴォック',
                    indication: ['UC', 'CD'],
                    dosing: {
                        type: 'fixed',
                        standard: {
                            dose: 30, // 維持期は15-30mg
                            unit: 'mg',
                            frequency: '1日1回',
                            interval: 1
                        }
                    },
                    pricing: {
                        formulation: '錠30mg',
                        unitPrice: 6628.00,
                        unitsPerDose: 1,
                        daysPerUnit: 1
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
                        type: 'fixed',
                        standard: {
                            dose: 0.92,
                            unit: 'mg',
                            frequency: '1日1回',
                            interval: 1
                        }
                    },
                    pricing: {
                        formulation: 'カプセル0.92mg',
                        unitPrice: 4792.80,
                        unitsPerDose: 1,
                        daysPerUnit: 1
                    }
                },
                {
                    id: 'etrasimod',
                    genericName: 'エトラシモド',
                    brandName: 'バベンティ',
                    indication: ['UC'],
                    dosing: {
                        type: 'fixed',
                        standard: {
                            dose: 2,
                            unit: 'mg',
                            frequency: '1日1回',
                            interval: 1
                        }
                    },
                    pricing: {
                        formulation: '錠2mg',
                        unitPrice: 4500.00, // 予想薬価（未収載）
                        unitsPerDose: 1,
                        daysPerUnit: 1,
                        note: '参考価格（2025年収載予定）'
                    }
                }
            ]
        }
    ]
};

// Export for use in app.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DRUG_DATABASE;
}
