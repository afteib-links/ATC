
/* ------------------------------
   BattleEngine（添付のロジックをほぼ踏襲）
   ※CSSは .battle-scope にスコープ化済み
------------------------------ */
const GRADES = {
    "初級": {
        "ops": [
            "+",
            "-",
            "×",
            "÷"
        ],
        "ratios": [
            0.3,
            0.3,
            0.2,
            0.2
        ],
        "logic": {
            "+": {
                "1": () => { const a=rand(1,10); const b=rand(1,10); return { q: `${a}+${b}`, a: a+b }; },
                "2": () => { const a=rand(1,10); const b=rand(1,10); const c=rand(1,10); return { q: `${a}+${b}+${c}`, a: a+b+c }; },
                "3": () => { const a=rand(10,50); const b=rand(10,50); return { q: `${a}+${b}`, a: a+b }; },
                "4": () => { const a=rand(10,50); const b=rand(10,50); const c=rand(10,50); return { q: `${a}+${b}+${c}`, a: a+b+c }; },
                "5": () => { const a=rand(100,200); const b=rand(100,200); const c=rand(1,50); return { q: `${a}+${b}+${c}`, a: a+b+c }; }
            },
            "-": {
                "1": () => { const a=rand(15, 30); const b=rand(1, 14); return { q: `${a}-${b}`, a: a-b }; },
                "2": () => { const a=rand(30, 60); const b=rand(1, 28); return { q: `${a}-${b}`, a: a-b }; },
                "3": () => { const a=rand(45, 90); const b=rand(1, 42); return { q: `${a}-${b}`, a: a-b }; },
                "4": () => { const a=rand(60, 120); const b=rand(1, 56); return { q: `${a}-${b}`, a: a-b }; },
                "5": () => { const a=rand(75, 150); const b=rand(1, 70); return { q: `${a}-${b}`, a: a-b }; }
            },
            "×": {
                "1": () => { const a=rand(2,5); const b=rand(2,5); return { q: `${a}×${b}`, a: a*b }; },
                "2": () => { const a=rand(2,9); const b=rand(2,9); return { q: `${a}×${b}`, a: a*b }; },
                "3": () => { const a=rand(2,9); const b=rand(2,9); return { q: `${a}×${b}`, a: a*b }; },
                "4": () => { const a=rand(11,15); const b=rand(2,9); return { q: `${a}×${b}`, a: a*b }; },
                "5": () => { const a=rand(11,15); const b=rand(2,9); return { q: `${a}×${b}`, a: a*b }; }
            },
            "÷": {
                "1": () => { const ans=rand(2,3); const b=rand(2,5); return { q: `${ans*b}÷${b}`, a: ans }; },
                "2": () => { const ans=rand(2,6); const b=rand(2,5); return { q: `${ans*b}÷${b}`, a: ans }; },
                "3": () => { const ans=rand(2,9); const b=rand(2,5); return { q: `${ans*b}÷${b}`, a: ans }; },
                "4": () => { const ans=rand(2,12); const b=rand(2,5); return { q: `${ans*b}÷${b}`, a: ans }; },
                "5": () => { const ans=rand(2,15); const b=rand(2,5); return { q: `${ans*b}÷${b}`, a: ans }; }
            }
        }
    },
    "中級": {
        "ops": [
            "+",
            "-",
            "×",
            "÷"
        ],
        "ratios": [
            0.3,
            0.3,
            0.2,
            0.2
        ],
        "logic": {
            "+": {
                "1": () => { const a=rand(1,20); const b=rand(1,20); return { q: `${a}+${b}`, a: a+b }; },
                "2": () => { const a=rand(1,20); const b=rand(1,20); return { q: `${a}+${b}`, a: a+b }; },
                "3": () => { const a=rand(10,100); const b=rand(10,100); return { q: `${a}+${b}`, a: a+b }; },
                "4": () => { const a=rand(10,100); const b=rand(10,100); return { q: `${a}+${b}`, a: a+b }; },
                "5": () => { const a=rand(100,400); const b=rand(100,400); const c=rand(1,50); return { q: `${a}+${b}+${c}`, a: a+b+c }; }
            },
            "-": {
                "1": () => { const a=rand(30, 60); const b=rand(1, 28); return { q: `${a}-${b}`, a: a-b }; },
                "2": () => { const a=rand(60, 120); const b=rand(1, 56); return { q: `${a}-${b}`, a: a-b }; },
                "3": () => { const a=rand(90, 180); const b=rand(1, 84); return { q: `${a}-${b}`, a: a-b }; },
                "4": () => { const a=rand(120, 240); const b=rand(1, 112); return { q: `${a}-${b}`, a: a-b }; },
                "5": () => { const a=rand(150, 300); const b=rand(1, 140); return { q: `${a}-${b}`, a: a-b }; }
            },
            "×": {
                "1": () => { const a=rand(2,5); const b=rand(2,5); return { q: `${a}×${b}`, a: a*b }; },
                "2": () => { const a=rand(2,9); const b=rand(2,9); return { q: `${a}×${b}`, a: a*b }; },
                "3": () => { const a=rand(2,9); const b=rand(2,9); return { q: `${a}×${b}`, a: a*b }; },
                "4": () => { const a=rand(11,20); const b=rand(2,9); return { q: `${a}×${b}`, a: a*b }; },
                "5": () => { const a=rand(11,20); const b=rand(2,9); return { q: `${a}×${b}`, a: a*b }; }
            },
            "÷": {
                "1": () => { const ans=rand(2,6); const b=rand(2,6); return { q: `${ans*b}÷${b}`, a: ans }; },
                "2": () => { const ans=rand(2,12); const b=rand(2,6); return { q: `${ans*b}÷${b}`, a: ans }; },
                "3": () => { const ans=rand(2,18); const b=rand(2,6); return { q: `${ans*b}÷${b}`, a: ans }; },
                "4": () => { const ans=rand(2,24); const b=rand(2,6); return { q: `${ans*b}÷${b}`, a: ans }; },
                "5": () => { const ans=rand(2,30); const b=rand(2,6); return { q: `${ans*b}÷${b}`, a: ans }; }
            }
        }
    },
    "上級": {
        "ops": [
            "+",
            "-",
            "×",
            "÷"
        ],
        "ratios": [
            0.3,
            0.3,
            0.2,
            0.2
        ],
        "logic": {
            "+": {
                "1": () => { const a=rand(1,30); const b=rand(1,30); return { q: `${a}+${b}`, a: a+b }; },
                "2": () => { const a=rand(1,30); const b=rand(1,30); return { q: `${a}+${b}`, a: a+b }; },
                "3": () => { const a=rand(10,150); const b=rand(10,150); return { q: `${a}+${b}`, a: a+b }; },
                "4": () => { const a=rand(10,150); const b=rand(10,150); return { q: `${a}+${b}`, a: a+b }; },
                "5": () => { const a=rand(100,600); const b=rand(100,600); const c=rand(1,50); return { q: `${a}+${b}+${c}`, a: a+b+c }; }
            },
            "-": {
                "1": () => { const a=rand(45, 90); const b=rand(1, 42); return { q: `${a}-${b}`, a: a-b }; },
                "2": () => { const a=rand(90, 180); const b=rand(1, 84); return { q: `${a}-${b}`, a: a-b }; },
                "3": () => { const a=rand(135, 270); const b=rand(1, 126); return { q: `${a}-${b}`, a: a-b }; },
                "4": () => { const a=rand(180, 360); const b=rand(1, 168); return { q: `${a}-${b}`, a: a-b }; },
                "5": () => { const a=rand(225, 450); const b=rand(1, 210); return { q: `${a}-${b}`, a: a-b }; }
            },
            "×": {
                "1": () => { const a=rand(2,5); const b=rand(2,5); return { q: `${a}×${b}`, a: a*b }; },
                "2": () => { const a=rand(2,9); const b=rand(2,9); return { q: `${a}×${b}`, a: a*b }; },
                "3": () => { const a=rand(2,9); const b=rand(2,9); return { q: `${a}×${b}`, a: a*b }; },
                "4": () => { const a=rand(11,25); const b=rand(2,9); return { q: `${a}×${b}`, a: a*b }; },
                "5": () => { const a=rand(11,25); const b=rand(2,9); return { q: `${a}×${b}`, a: a*b }; }
            },
            "÷": {
                "1": () => { const ans=rand(2,9); const b=rand(2,7); return { q: `${ans*b}÷${b}`, a: ans }; },
                "2": () => { const ans=rand(2,18); const b=rand(2,7); return { q: `${ans*b}÷${b}`, a: ans }; },
                "3": () => { const ans=rand(2,27); const b=rand(2,7); return { q: `${ans*b}÷${b}`, a: ans }; },
                "4": () => { const ans=rand(2,36); const b=rand(2,7); return { q: `${ans*b}÷${b}`, a: ans }; },
                "5": () => { const ans=rand(2,45); const b=rand(2,7); return { q: `${ans*b}÷${b}`, a: ans }; }
            }
        }
    },
    "超級": {
        "ops": [
            "+",
            "-",
            "×",
            "÷"
        ],
        "ratios": [
            0.3,
            0.3,
            0.2,
            0.2
        ],
        "logic": {
            "+": {
                "1": () => { const a=rand(1,40); const b=rand(1,40); return { q: `${a}+${b}`, a: a+b }; },
                "2": () => { const a=rand(1,40); const b=rand(1,40); return { q: `${a}+${b}`, a: a+b }; },
                "3": () => { const a=rand(10,200); const b=rand(10,200); return { q: `${a}+${b}`, a: a+b }; },
                "4": () => { const a=rand(10,200); const b=rand(10,200); return { q: `${a}+${b}`, a: a+b }; },
                "5": () => { const a=rand(100,800); const b=rand(100,800); const c=rand(1,50); return { q: `${a}+${b}+${c}`, a: a+b+c }; }
            },
            "-": {
                "1": () => { const a=rand(60, 120); const b=rand(1, 56); return { q: `${a}-${b}`, a: a-b }; },
                "2": () => { const a=rand(120, 240); const b=rand(1, 112); return { q: `${a}-${b}`, a: a-b }; },
                "3": () => { const a=rand(180, 360); const b=rand(1, 168); return { q: `${a}-${b}`, a: a-b }; },
                "4": () => { const a=rand(240, 480); const b=rand(1, 224); return { q: `${a}-${b}`, a: a-b }; },
                "5": () => { const a=rand(300, 600); const b=rand(1, 280); return { q: `${a}-${b}`, a: a-b }; }
            },
            "×": {
                "1": () => { const a=rand(2,5); const b=rand(2,5); return { q: `${a}×${b}`, a: a*b }; },
                "2": () => { const a=rand(2,9); const b=rand(2,9); return { q: `${a}×${b}`, a: a*b }; },
                "3": () => { const a=rand(2,9); const b=rand(2,9); return { q: `${a}×${b}`, a: a*b }; },
                "4": () => { const a=rand(11,30); const b=rand(2,9); return { q: `${a}×${b}`, a: a*b }; },
                "5": () => { const a=rand(11,30); const b=rand(2,9); return { q: `${a}×${b}`, a: a*b }; }
            },
            "÷": {
                "1": () => { const ans=rand(2,12); const b=rand(2,8); return { q: `${ans*b}÷${b}`, a: ans }; },
                "2": () => { const ans=rand(2,24); const b=rand(2,8); return { q: `${ans*b}÷${b}`, a: ans }; },
                "3": () => { const ans=rand(2,36); const b=rand(2,8); return { q: `${ans*b}÷${b}`, a: ans }; },
                "4": () => { const ans=rand(2,48); const b=rand(2,8); return { q: `${ans*b}÷${b}`, a: ans }; },
                "5": () => { const ans=rand(2,60); const b=rand(2,8); return { q: `${ans*b}÷${b}`, a: ans }; }
            }
        }
    },
    "極級": {
        "ops": [
            "+",
            "-",
            "×",
            "÷"
        ],
        "ratios": [
            0.3,
            0.3,
            0.2,
            0.2
        ],
        "logic": {
            "+": {
                "1": () => { const a=rand(1,50); const b=rand(1,50); return { q: `${a}+${b}`, a: a+b }; },
                "2": () => { const a=rand(1,50); const b=rand(1,50); return { q: `${a}+${b}`, a: a+b }; },
                "3": () => { const a=rand(10,250); const b=rand(10,250); return { q: `${a}+${b}`, a: a+b }; },
                "4": () => { const a=rand(10,250); const b=rand(10,250); return { q: `${a}+${b}`, a: a+b }; },
                "5": () => { const a=rand(100,1000); const b=rand(100,1000); const c=rand(1,50); return { q: `${a}+${b}+${c}`, a: a+b+c }; }
            },
            "-": {
                "1": () => { const a=rand(75, 150); const b=rand(1, 70); return { q: `${a}-${b}`, a: a-b }; },
                "2": () => { const a=rand(150, 300); const b=rand(1, 140); return { q: `${a}-${b}`, a: a-b }; },
                "3": () => { const a=rand(225, 450); const b=rand(1, 210); return { q: `${a}-${b}`, a: a-b }; },
                "4": () => { const a=rand(300, 600); const b=rand(1, 280); return { q: `${a}-${b}`, a: a-b }; },
                "5": () => { const a=rand(375, 750); const b=rand(1, 350); return { q: `${a}-${b}`, a: a-b }; }
            },
            "×": {
                "1": () => { const a=rand(2,5); const b=rand(2,5); return { q: `${a}×${b}`, a: a*b }; },
                "2": () => { const a=rand(2,9); const b=rand(2,9); return { q: `${a}×${b}`, a: a*b }; },
                "3": () => { const a=rand(2,9); const b=rand(2,9); return { q: `${a}×${b}`, a: a*b }; },
                "4": () => { const a=rand(11,35); const b=rand(2,9); return { q: `${a}×${b}`, a: a*b }; },
                "5": () => { const a=rand(11,35); const b=rand(2,9); return { q: `${a}×${b}`, a: a*b }; }
            },
            "÷": {
                "1": () => { const ans=rand(2,15); const b=rand(2,9); return { q: `${ans*b}÷${b}`, a: ans }; },
                "2": () => { const ans=rand(2,30); const b=rand(2,9); return { q: `${ans*b}÷${b}`, a: ans }; },
                "3": () => { const ans=rand(2,45); const b=rand(2,9); return { q: `${ans*b}÷${b}`, a: ans }; },
                "4": () => { const ans=rand(2,60); const b=rand(2,9); return { q: `${ans*b}÷${b}`, a: ans }; },
                "5": () => { const ans=rand(2,75); const b=rand(2,9); return { q: `${ans*b}÷${b}`, a: ans }; }
            }
        }
    }
};