//var socket = io.connect('https://safe-reef-35714.herokuapp.com/');
//var socket = io.connect('ws://192.168.11.250:5555');
//var socket = io.connect('ws://192.168.11.3:5555');
var socket = io.connect('ws://localhost:5555');

var myPlayerID = 1;

socket.on("connect", function () {
    var id = socket.io.engine.id;
    console.log("Connected ID: " + id);
});

enchant();

window.onload = function ()
{
    var core = new Core(1280, 720);

    //悪魔                       Type   Dir  Level ID   BASECOST COST  HP  ATK  SPEED    
    var defaultPUPU = new Demon("PUPU", "None", 0, null, 100, 100, 150, 250, 3);
    var defaultPOPO = new Demon("POPO", "None", 0, null, 100, 100, 1000, 100, 2);
    var defaultPIPI = new Demon("PIPI", "None", 0, null, 100, 100, 100, 50, 5);

    //悪魔
    var PUPU;
    var POPO;
    var PIPI;

    //自分の初期所持コスト
    var defaulthaveCost = 500;
    var haveCost;

    //最大所持コスト
    var defaultMaxCost = 3000;
    var MaxCost;

    //毎秒取得できるコスト
    var fpsCost = 25;

    //最大ステータス
    var MAXHP = 7000;
    var MAXATK = 1700;
    var MAXSPEED = 5;

    //タッチし始めの場所を確認
    var tapPos = new TapPos();
    //なにをタップしたかの確認
    var tapObj;
    //コストが払えるかのフラグ
    var Flag;
    //タイマー
    var Timer;

    //必殺技を撃ったかのフラグ
    var deadlyFlag;
    //必殺技コスト数
    var deadlyCost = 10;
    //パワーアップのコストが増えるレベルの間隔
    var powerUpInterval = 5;

    //10個までの魂保管用配列
    var spiritsLength = 10;
    var Spirits = new Array(spiritsLength);

    //魂をふよふよさせるために必要な変数
    var degree = 0;

    //キー割り当て(デバッグ用)
    core.keybind(' '.charCodeAt(0), 'summonSpirit');
    core.keybind('a'.charCodeAt(0), 'Main');
    core.keybind('s'.charCodeAt(0), 'Result');
    core.keybind('d'.charCodeAt(0), 'Matching');
    core.keybind('p'.charCodeAt(0), 'Pause');

    //押した時に一回だけ呼ばれるようにするためのフラグ
    var oneCallFlag = false;
    var buttonUpFlag = false;

    var stoppingFlag = false;

    //事前にロードを行う
    //背景
    core.preload('img/back5.png');
    core.preload('matchingUI/sumahoTitle.png');
    core.preload('matchingUI/sumatai_haikei.png');
    core.preload('matchingUI/otu.png');

    //ボタン
    {
        //1P
        {
            //ププ
            {
                core.preload('button/1p_red.png');
                core.preload('button/1p_red_migi.png');
                core.preload('button/1p_red_sita.png');
                core.preload('button/1p_red_ue.png');
            }
            //ポポ
            {
                core.preload('button/1p_green.png');
                core.preload('button/1p_green_migi.png');
                core.preload('button/1p_green_sita.png');
                core.preload('button/1p_green_ue.png');
            }
            //ピピ
            {
                core.preload('button/1p_blue.png');
                core.preload('button/1p_blue_migi.png');
                core.preload('button/1p_blue_sita.png');
                core.preload('button/1p_blue_ue.png');
            }
        }
        //2P
        {
            //ププ
            {
                core.preload('button/2p_red.png');
                core.preload('button/2p_red_hidari.png');
                core.preload('button/2p_red_sita.png');
                core.preload('button/2p_red_ue.png');
            }
            //ポポ
            {
                core.preload('button/2p_green.png');
                core.preload('button/2p_green_hidari.png');
                core.preload('button/2p_green_sita.png');
                core.preload('button/2p_green_ue.png');
            }
            //ピピ
            {
                core.preload('button/2p_blue.png');
                core.preload('button/2p_blue_hidari.png');
                core.preload('button/2p_blue_sita.png');
                core.preload('button/2p_blue_ue.png');
            }
        }
        core.preload('button/sikaku_pipi_blue.png');
        core.preload('button/sikaku_pipi_use.png');
        core.preload('button/sikaku_popo_green.png');
        core.preload('button/sikaku_popo_use.png');
        core.preload('button/sikaku_pupu_red.png');
        core.preload('button/sikaku_pupu_use.png');

        core.preload('img/deadly.png');
        core.preload('img/deadly2.png');
        core.preload('img/deadly3.png');
    }    

    //UI・フォント
    {
        //フォント
        {
            core.preload('img/CP.png');
            core.preload('img/rednumber_siro.png');
            core.preload('img/blacknumber.png');
            core.preload('img/kosutoko.png');
            core.preload('img/max.png');
            core.preload('img/LV.png');
            core.preload('img/Lv_mozi.png');
        }
        //UI
        {
            //ステータスフレーム
            {
                core.preload('img/huki_blue.png');
                core.preload('img/huki_green.png');
                core.preload('img/huki_red.png');
                core.preload('img/kyouka_sita.png');
            }
            //カマ
            {
                core.preload('img/kama_soul.png');
                core.preload('img/kama_soul2.png');
                core.preload('img/kama_soul_under.png');
            }
            //
            core.preload('matchingUI/game_end_tap.png');
            core.preload('matchingUI/tap_the_screen.png');
            core.preload('matchingUI/title.png');
            core.preload('matchingUI/teamb.png');
            core.preload('matchingUI/teamr.png');
            core.preload('matchingUI/matching.png');
            core.preload('matchingUI/sumahotaiki.png');
            core.preload('matchingUI/see_mo.png');
            
            core.preload('img/attack.png');
            core.preload('img/shield.png');
            core.preload('img/beam.png');
            core.preload('img/attack_lv10.png');
            core.preload('img/shield_lv10.png');
            core.preload('img/beam_lv10.png');
            
            core.preload('img/kankei.png');
        }
    }   

    //スピリット
    core.preload('img/pupu_soul.png');
    core.preload('img/popo_soul.png');
    core.preload('img/pipi_soul.png');

    //gif
    core.preload('img/sumahotatti.png');

    //fpsの設定
    core.fps = 24;

    core.onload = function ()
    {
//////////////////////////タイトルシーン//////////////////////////////////////////////////////////////////////////////
        var TitleScene = function ()
        {
            var scene = new Scene();

            //全体の初期化
            PUPU = defaultPUPU;
            POPO = defaultPOPO;
            PIPI = defaultPIPI;

            haveCost = defaulthaveCost;
            MaxCost = defaultMaxCost;

            for (var i = 0; i < spiritsLength; i++)
            {
                Spirits[i] = null;
            }

            oneCallFlag = stoppingFlag = deadlyFlag = buttonUpFlag = false;

            core.frame = 0;
            
            ////////画像情報処理////////
            //背景
            var titleBack = new Sprite(1280, 720);
            titleBack.image = core.assets['matchingUI/sumahoTitle.png'];
            titleBack.scale(1, 1);
            titleBack.x = 0;
            titleBack.y = 0;

            var title = new Sprite(960, 560);
            title.image = core.assets['matchingUI/title.png'];
            title.scale(1, 1);
            title.x = core.width / 2 - title.width / 2;
            title.y = 0;

            var tapRequest = new Sprite(1024, 256);
            tapRequest.image = core.assets['matchingUI/tap_the_screen.png'];
            tapRequest.scale(0.5, 0.5);
            tapRequest.x = core.width / 2 - tapRequest.width / 2;
            tapRequest.y = core.height / 2 + tapRequest.height / 2;

            var PUPUgif = new Sprite(600, 600);
            PUPUgif.image = core.assets['img/sumahotatti.png'];
            PUPUgif.scale(0.5, 0.5);
            PUPUgif.x = core.width - PUPUgif.width * 0.8;
            PUPUgif.y = core.height - PUPUgif.height * 0.8;
            PUPUgif.frame = 0;

            scene.addEventListener('enterframe', function ()
            {
                var radian = Math.PI / 180 * degree;
                tapRequest.y += Math.sin(radian);
                degree += 3;
                PUPUgif.frame = PUPUgif.age % 24;
            });

            ////////メイン処理////////
            scene.addEventListener(Event.TOUCH_START, function ()
            {
                //3秒経過しないと受け付けない
                if (core.frame > core.fps * 1.5)
                {
                    //現在表示しているシーンをゲームシーンに置き換えます
                    core.replaceScene(MainScene());
                    //core.replaceScene(MatchingScene());
                }                
            });            

            ////////描画////////
            scene.addChild(titleBack);
            scene.addChild(title);
            scene.addChild(tapRequest);
            scene.addChild(PUPUgif);

            return scene;
        };

//////////////////////////マッチングシーン//////////////////////////////////////////////////////////////////////////////
        var MatchingScene = function ()
        {
            var scene = new Scene();

            socket.emit("EnterRobby");

            //プレイヤーIDのセット
            socket.on("PushPlayerID", function (idData) {
                myPlayerID = idData.PlayerID;
                console.log("Connect PlayerID: " + myPlayerID);
            });

            var back = new Sprite(1280, 720);
            back.image = core.assets['matchingUI/sumatai_haikei.png'];
            back.scale(1, 1);
            back.x = 0;
            back.y = 0;

            var teamColor = new Sprite(1024, 256);
            teamColor.scale(0.5, 0.5);
            teamColor.x = 500;
            teamColor.y = -50;

            var setumei = new Sprite(512, 512);
            setumei.image = core.assets["matchingUI/sumahotaiki.png"];
            setumei.x = core.width / 2 - setumei.width / 2;
            setumei.y = core.height / 2 - setumei.height / 2;
            setumei.frame = 0;

            var showTime = 0;
            var moveTime = 2;
            var moveFlag = false;

            scene.addEventListener('enterframe', function ()
            {
                if (myPlayerID / 2 == 0) {
                    teamColor.image = core.assets['matchingUI/teamr.png'];
                }
                else {
                    teamColor.image = core.assets['matchingUI/teamb.png'];
                }

                if (!moveFlag) {
                    showTime = core.frame / core.fps;
                    setumei.x -= showTime * showTime;
                }
                else {
                    showTime = core.frame / core.fps - 4.85;
                    setumei.x -= showTime * showTime;
                }

                if (setumei.x + setumei.width < 0) {
                    setumei.x = core.width;
                    core.frame = 0;
                    showTime = core.frame / core.fps - 4.85;
                    moveFlag = true;
                    setumei.frame++;
                }
            });

            socket.on("PushMatchingEnd", function () {
                //現在表示しているシーンをゲームシーンに置き換えます
                core.replaceScene(MainScene());
            });

            scene.addChild(back);
            scene.addChild(teamColor);
            scene.addChild(setumei);

            return scene;
        };

//////////////////////////メインシーン//////////////////////////////////////////////////////////////////////////////
        var MainScene = function ()
        {
            var scene = new Scene();

            //フレームリセット
            core.frame = 0;

            //全体の初期化
            PUPU = InitializeDemon(PUPU, defaultPUPU);
            POPO = InitializeDemon(POPO, defaultPOPO);
            PIPI = InitializeDemon(PIPI, defaultPIPI);

            haveCost = InitializeCost(haveCost, defaulthaveCost);
            MaxCost = InitializeMaxCost(MaxCost, defaultMaxCost);

            for (var i = 0; i < spiritsLength; i++) {
                Spirits[i] = null;
            }

            oneCallFlag = stoppingFlag = deadlyFlag = buttonUpFlag = false;

            //フレーム表示
            var FPSlbl = new Label();
            FPSlbl.font = "italic 36px 'ＭＳ 明朝', 'ＭＳ ゴシック', 'Times New Roman', serif, sans-serif";

            ////////画像情報処理////////
            {
                //ププのボタン
                var pupuBtn = new Sprite(600, 600);
                switch (myPlayerID)
                {
                    case 0:
                        pupuBtn.image = core.assets['button/1p_red.png'];
                        break;
                    case 1:
                        pupuBtn.image = core.assets['button/2p_red.png'];
                }
                
                pupuBtn.scale(0.3, 0.3);
                pupuBtn.x = 850;
                pupuBtn.y = -200;

                //ポポのボタン
                var popoBtn = new Sprite(600, 600);
                switch (myPlayerID) {
                    case 0:
                        popoBtn.image = core.assets['button/1p_green.png'];
                        break;
                    case 1:
                        popoBtn.image = core.assets['button/2p_green.png'];
                }
                popoBtn.scale(0.3, 0.3);
                popoBtn.x = 850;
                popoBtn.y = 50;

                //ピピのボタン
                var pipiBtn = new Sprite(600, 600);
                switch (myPlayerID) {
                    case 0:
                        pipiBtn.image = core.assets['button/1p_blue.png'];
                        break;
                    case 1:
                        pipiBtn.image = core.assets['button/2p_blue.png'];
                }
                pipiBtn.scale(0.3, 0.3);
                pipiBtn.x = 850;
                pipiBtn.y = 300;

                //ププのパワーアップボタン
                var PUPUPowerUpButton = new Sprite(600, 600);
                PUPUPowerUpButton.image = core.assets['button/sikaku_pupu_red.png'];
                PUPUPowerUpButton.scale(0.2, 0.2);
                PUPUPowerUpButton.x = -190;
                PUPUPowerUpButton.y = -80;

                //ププのパワーアップボタン
                var POPOPowerUpButton = new Sprite(600, 600);
                POPOPowerUpButton.image = core.assets['button/sikaku_popo_green.png'];
                POPOPowerUpButton.scale(0.2, 0.2);
                POPOPowerUpButton.x = -190;
                POPOPowerUpButton.y = 100;

                //ププのパワーアップボタン
                var PIPIPowerUpButton = new Sprite(600, 600);
                PIPIPowerUpButton.image = core.assets['button/sikaku_pipi_blue.png'];
                PIPIPowerUpButton.scale(0.2, 0.2);
                PIPIPowerUpButton.x = -190;
                PIPIPowerUpButton.y = 280;

                //必殺技のボタン
                var deadlyBtn = new Sprite(239, 140);
                deadlyBtn.image = core.assets['img/deadly3.png'];
                deadlyBtn.scale(1, 1);
                deadlyBtn.opacity = 1;
                deadlyBtn.x = 250;
                deadlyBtn.y = 0;

                //背景
                var back = new Sprite(3200, 1800);
                back.image = core.assets['img/back5.png'];
                back.x = 0;
                back.y = 0;

                //UI
                //ププのUI背景
                var PUPU_UI = new Sprite(600, 600);
                PUPU_UI.image = core.assets['img/huki_red.png'];
                PUPU_UI.scale(0.5, 0.5);
                PUPU_UI.x = 600;
                PUPU_UI.y = -175;

                //ポポのUI背景
                var POPO_UI = new Sprite(600, 600);
                POPO_UI.image = core.assets['img/huki_green.png'];
                POPO_UI.scale(0.5, 0.5);
                POPO_UI.x = 600;
                POPO_UI.y = 60;

                //ピピのUI背景
                var PIPI_UI = new Sprite(600, 600);
                PIPI_UI.image = core.assets['img/huki_blue.png'];
                PIPI_UI.scale(0.5, 0.5);
                PIPI_UI.x = 600;
                PIPI_UI.y = 295;

                //強化ボタンの背景
                var PowerUpBack = new Sprite(160, 600);
                PowerUpBack.image = core.assets['img/kyouka_sita.png'];
                PowerUpBack.scale(1, 1);
                PowerUpBack.x = 30;
                PowerUpBack.y = 80;

                //カマ本体
                var ponpu = new Sprite(600, 400);
                switch(myPlayerID)
                {
                    case 0:
                        ponpu.image = core.assets['img/kama_soul.png'];
                        break;
                    case 1:
                        ponpu.image = core.assets['img/kama_soul2.png'];
                }                
                ponpu.scale(0.8, 0.8);
                ponpu.x = 150;
                ponpu.y = 200;

                //最大と表示するためのUI
                var MaxSpirit = new Sprite(256, 256);
                MaxSpirit.image = core.assets['img/max.png'];
                MaxSpirit.scale(1, 1);
                MaxSpirit.x = 175;
                MaxSpirit.y = 300;
                MaxSpirit.opacity = 0.0;

                //CPのフォント
                var CPFont = new Sprite(150, 150);
                CPFont.image = core.assets['img/CP.png'];
                CPFont.scale(0.7, 0.7);
                CPFont.x = 600;
                CPFont.y = 600;

                //所持コストのフォント
                var costFont = new Array();
                var costDigit = 4;  //桁数(初期設定4桁)
                for (var i = 0; i < costDigit; i++) {
                    costFont[i] = new Sprite(120, 120);
                    costFont[i].image = core.assets['img/rednumber_siro.png'];
                    costFont[i].scale(2, 2);
                    costFont[i].x = 600 - (i + 1) * 75;
                    costFont[i].y = 600;
                    costFont[i].frame = 0;
                }

                //デーモンに必要なコストのフォント
                var DemoncostDigit = 3;  //桁数(初期設定3桁)

                var PUPUcostFont = new Array();
                for (var i = 0; i < DemoncostDigit; i++) {
                    PUPUcostFont[i] = new Sprite(120, 120);
                    PUPUcostFont[i].image = core.assets['img/blacknumber.png'];
                    PUPUcostFont[i].scale(1, 1);
                    PUPUcostFont[i].x = 950 - (i + 1) * 40;
                    PUPUcostFont[i].y = 70;
                    PUPUcostFont[i].frame = 0;
                }

                var POPOcostFont = new Array();
                for (var i = 0; i < DemoncostDigit; i++) {
                    POPOcostFont[i] = new Sprite(120, 120);
                    POPOcostFont[i].image = core.assets['img/blacknumber.png'];
                    POPOcostFont[i].scale(1, 1);
                    POPOcostFont[i].x = 950 - (i + 1) * 40;
                    POPOcostFont[i].y = 310;
                    POPOcostFont[i].frame = 0;
                }

                var PIPIcostFont = new Array();
                for (var i = 0; i < DemoncostDigit; i++) {
                    PIPIcostFont[i] = new Sprite(120, 120);
                    PIPIcostFont[i].image = core.assets['img/blacknumber.png'];
                    PIPIcostFont[i].scale(1, 1);
                    PIPIcostFont[i].x = 950 - (i + 1) * 40;
                    PIPIcostFont[i].y = 545;
                    PIPIcostFont[i].frame = 0;
                }

                //デーモンのレベル桁数
                var DemonLevelDigit = 2;    //桁数

                var PUPULevelFont = new Array();
                for (var i = 0; i < DemonLevelDigit; i++)
                {
                    PUPULevelFont[i] = new Sprite(120, 120);
                    PUPULevelFont[i].image = core.assets['img/blacknumber.png'];
                    PUPULevelFont[i].scale(1, 1);
                    PUPULevelFont[i].x = 950 - (i + 1) * 40;
                    PUPULevelFont[i].y = 5;
                    PUPULevelFont[i].frame = 0;
                }

                var POPOLevelFont = new Array();
                for (var i = 0; i < DemonLevelDigit; i++) {
                    POPOLevelFont[i] = new Sprite(120, 120);
                    POPOLevelFont[i].image = core.assets['img/blacknumber.png'];
                    POPOLevelFont[i].scale(1, 1);
                    POPOLevelFont[i].x = 950 - (i + 1) * 40;
                    POPOLevelFont[i].y = 240;
                    POPOLevelFont[i].frame = 0;
                }

                var PIPILevelFont = new Array();
                for (var i = 0; i < DemonLevelDigit; i++) {
                    PIPILevelFont[i] = new Sprite(120, 120);
                    PIPILevelFont[i].image = core.assets['img/blacknumber.png'];
                    PIPILevelFont[i].scale(1, 1);
                    PIPILevelFont[i].x = 950 - (i + 1) * 40;
                    PIPILevelFont[i].y = 475;
                    PIPILevelFont[i].frame = 0;
                }

                //相性関係図
                var weakPattern = new Sprite(600, 600);
                weakPattern.image = core.assets['img/kankei.png'];
                weakPattern.scale(0.25, 0.25);
                weakPattern.x = 300;
                weakPattern.y = -150;

                ////////ステータス部分//////
                {
                    var PUPUCostFont = new Sprite(150, 150);
                    PUPUCostFont.image = core.assets['img/kosutoko.png'];
                    PUPUCostFont.scale(0.5, 0.5);
                    PUPUCostFont.x = 750;
                    PUPUCostFont.y = 60;

                    var PUPUicon = new Sprite(600, 600);
                    PUPUicon.image = core.assets['img/attack.png'];
                    PUPUicon.scale(0.2, 0.2);
                    PUPUicon.x = 450;
                    PUPUicon.y = -250;

                    var PUPULv = new Sprite(150, 150);
                    PUPULv.image = core.assets['img/Lv_mozi.png'];
                    PUPULv.scale(0.5, 0.5);
                    PUPULv.x = 800;
                    PUPULv.y = -10;

                    var POPOCostFont = new Sprite(150, 150);
                    POPOCostFont.image = core.assets['img/kosutoko.png'];
                    POPOCostFont.scale(0.5, 0.5);
                    POPOCostFont.x = 750;
                    POPOCostFont.y = 300;

                    var POPOicon = new Sprite(600, 600);
                    POPOicon.image = core.assets['img/shield.png'];
                    POPOicon.scale(0.2, 0.2);
                    POPOicon.x = 450;
                    POPOicon.y = -20;

                    var POPOLv = new Sprite(150, 150);
                    POPOLv.image = core.assets['img/Lv_mozi.png'];
                    POPOLv.scale(0.5, 0.5);
                    POPOLv.x = 800;
                    POPOLv.y = 230;

                    var PIPICostFont = new Sprite(150, 150);
                    PIPICostFont.image = core.assets['img/kosutoko.png'];
                    PIPICostFont.scale(0.5, 0.5);
                    PIPICostFont.x = 750;
                    PIPICostFont.y = 535;

                    var PIPIicon = new Sprite(600, 600);
                    PIPIicon.image = core.assets['img/beam.png'];
                    PIPIicon.scale(0.2, 0.2);
                    PIPIicon.x = 450;
                    PIPIicon.y = 210;

                    var PIPILv = new Sprite(150, 150);
                    PIPILv.image = core.assets['img/Lv_mozi.png'];
                    PIPILv.scale(0.5, 0.5);
                    PIPILv.x = 800;
                    PIPILv.y = 460;
                }
            }
            ////////メイン処理////////

            //秒間コストを受け取り
            socket.on("PushSecondCost", function (CostData) {
                var intCost = parseInt(CostData.Cost.toString());
                if (haveCost < MaxCost) {
                    haveCost += intCost;
                }
                else {
                    haveCost = MaxCost;
                }
            });

            //倒す・倒された時のコストを受け取り
            socket.on("PushAddCost", function (CostData) {
                var _PlyaerID = parseInt(CostData.PlayerID.toString());
                var intCost = parseInt(CostData.Cost.toString());
                if (_PlyaerID == myPlayerID)
                {
                    if (haveCost < MaxCost) {
                        haveCost += intCost;
                    }
                    else {
                        haveCost = MaxCost;
                    }
                }
            });

            //ポーズ画面へ移動
            socket.on("PushStopRequest", function ()
            {
                if (!stoppingFlag)
                {
                    stoppingFlag = true;
                    core.pushScene(PauseScene());
                }                    
            });

            //ゲーム終了を受け取ってリザルト画面へ移行
            socket.on("PushGameEndRequest", function ()
            {
                core.replaceScene(ResultScene());
            });

            //フレームごとに処理する
            core.addEventListener('enterframe', function ()
            {
                FPSlbl.text = core.actualFps;

                //CPフォント
                for (var i = costDigit - 1; i >= 0; i--) {
                    FontSet(haveCost, i, costFont[i]);
                }

                for (var i = DemoncostDigit - 1; i >= 0; i--) {
                    FontSet(PUPU.Cost, i, PUPUcostFont[i]);
                    FontSet(POPO.Cost, i, POPOcostFont[i]);
                    FontSet(PIPI.Cost, i, PIPIcostFont[i]);
                }

                for (var i = DemonLevelDigit - 1; i >= 0; i--)
                {
                    FontSet(PUPU.Level, i, PUPULevelFont[i]);
                    FontSet(POPO.Level, i, POPOLevelFont[i]);
                    FontSet(PIPI.Level, i, PIPILevelFont[i]);
                }

                //レベルでアイコン変化
                if (PUPU.Level >= 10)
                {
                    PUPUicon.image = core.assets['img/attack_lv10.png'];
                }

                if (POPO.Level >= 10)
                {
                    POPOicon.image = core.assets['img/shield_lv10.png'];
                }

                if (PIPI.Level >= 10)
                {
                    PIPIicon.image = core.assets['img/beam_lv10.png'];
                }

                //スペースボタンを押すと魂が取得できるように
                core.addEventListener('summonSpiritbuttondown', function () {
                    oneCallFlag = true;
                });

                var maxCounter = 0;

                //ポーズボタン
                if (!core.input.up)
                {
                    buttonUpFlag = true;
                }

                if(core.input.up && buttonUpFlag)
                {
                    buttonUpFlag = false;
                    socket.emit("StopRequest");                 
                }

                core.addEventListener('summonSpiritbuttonup', function () {
                    if (oneCallFlag) {
                        socket.emit("SpiritPush", { Type: "PUPU", PlayerID: myPlayerID });
                        oneCallFlag = false;
                    }
                });

                for (var i = 0; i < spiritsLength; i++) {
                    if (Spirits[i] != null) 
                    {
                        var radian = Math.PI / 180 * degree;
                        Spirits[i].Sprite.y += Math.sin(radian) * 0.5;
                    }
                }

                for (var i = 0; i < spiritsLength; i++) {
                    if (Spirits[i] != null) {
                        ++maxCounter;
                    }

                    if (maxCounter == 10) {
                        if (!deadlyFlag && deadlyBtn.image == core.assets['img/deadly3.png'])
                        {
                            deadlyBtn.image = core.assets['img/deadly.png'];
                        }              
                        scene.addChild(MaxSpirit);
                        MaxSpirit.opacity = 0.8;
                    }
                    else {
                        if (deadlyFlag)
                            deadlyBtn.image = core.assets['img/deadly3.png'];
                        scene.removeChild(MaxSpirit);
                    }
                }                

                degree += 1.5;
            });

            //ボタンが押された時の処理
            pupuBtn.on(Event.TOUCH_START, function () {
                tapObj = "pupuBtn";
            });            

            popoBtn.on(Event.TOUCH_START, function () {
                tapObj = "popoBtn";
            });

            pipiBtn.on(Event.TOUCH_START, function () {
                tapObj = "pipiBtn";
            });

            PUPUPowerUpButton.on(Event.TOUCH_START, function () {
                PUPUPowerUpButton.image = core.assets['button/sikaku_pupu_use.png'];
            });

            POPOPowerUpButton.on(Event.TOUCH_START, function () {
                POPOPowerUpButton.image = core.assets['button/sikaku_popo_use.png'];
            });

            PIPIPowerUpButton.on(Event.TOUCH_START, function () {
                PIPIPowerUpButton.image = core.assets['button/sikaku_pipi_use.png'];
            });

            deadlyBtn.on(Event.TOUCH_START, function () {
                if (deadlyBtn.image == core.assets['img/deadly.png']) {
                    deadlyBtn.image = core.assets['img/deadly2.png'];
                    tapObj = "deadlyBtn";
                }
            });

            //タップした場所の座標取得
            scene.on(Event.TOUCH_START, function (startPos) {
                tapPos.x = startPos.x;
                tapPos.y = startPos.y;
            });

            //離された時の処理
            //ププ
            pupuBtn.on(Event.TOUCH_END, function () {
                switch (myPlayerID) {
                    case 0:
                        pupuBtn.image = core.assets['button/1p_red.png'];
                        break;
                    case 1:
                        pupuBtn.image = core.assets['button/2p_red.png'];
                }
            });

            //ポポ
            popoBtn.on(Event.TOUCH_END, function () {
                switch (myPlayerID) {
                    case 0:
                        popoBtn.image = core.assets['button/1p_green.png'];
                        break;
                    case 1:
                        popoBtn.image = core.assets['button/2p_green.png'];
                }
            });
            
            //ピピ
            pipiBtn.on(Event.TOUCH_END, function () {
                switch (myPlayerID) {
                    case 0:
                        pipiBtn.image = core.assets['button/1p_blue.png'];
                        break;
                    case 1:
                        pipiBtn.image = core.assets['button/2p_blue.png'];
                }
            });

            //ププのパワーアップ
            PUPUPowerUpButton.on(Event.TOUCH_END, function () {
                PUPUPowerUpButton.image = core.assets['button/sikaku_pupu_red.png'];
                if (SpiritCheck(Spirits, Math.floor(PUPU.Level / powerUpInterval + 1), spiritsLength) && PUPU.Level < 20) {
                    PowerUp(PUPU);
                    //使用した魂の削除
                    Spirits = UsedSpirits(Spirits, Math.floor(PUPU.Level / powerUpInterval + 1), spiritsLength, scene);
                    //必殺技ボタンが使えなくなるように
                    deadlyBtn.image = core.assets['img/deadly3.png'];
                }
            });

            //ポポのパワーアップ
            POPOPowerUpButton.on(Event.TOUCH_END, function () {
                POPOPowerUpButton.image = core.assets['button/sikaku_popo_green.png'];
                if (SpiritCheck(Spirits, Math.floor(POPO.Level / powerUpInterval + 1), spiritsLength) && POPO.Level < 20) {
                    PowerUp(POPO);
                    //使用した魂の削除
                    Spirits = UsedSpirits(Spirits, Math.floor(POPO.Level / powerUpInterval + 1), spiritsLength, scene);
                    //必殺技ボタンが使えなくなるように
                    deadlyBtn.image = core.assets['img/deadly3.png'];
                }
            });

            //ピピのパワーアップ
            PIPIPowerUpButton.on(Event.TOUCH_END, function () {
                PIPIPowerUpButton.image = core.assets['button/sikaku_pipi_blue.png'];
                if (SpiritCheck(Spirits, Math.floor(PIPI.Level / powerUpInterval + 1), spiritsLength) && PIPI.Level < 20) {
                    PowerUp(PIPI);
                    //使用した魂の削除
                    Spirits = UsedSpirits(Spirits, Math.floor(PIPI.Level / powerUpInterval + 1), spiritsLength, scene);
                    //必殺技ボタンが使えなくなるように
                    deadlyBtn.image = core.assets['img/deadly3.png'];
                }
            });

            deadlyBtn.on(Event.TOUCH_END, function () {
                if (!deadlyFlag) {
                    //必殺コスト分の魂があるか確認。
                    if (SpiritCheck(Spirits, deadlyCost, spiritsLength)) {
                        deadlyBtn.image = core.assets['img/deadly3.png'];
                        //ここで必殺情報をサーバーに送る
                        PushDeadly(myPlayerID);
                        //コストを最大に回復
                        haveCost = MaxCost;
                        //使用フラグを立てる
                        deadlyFlag = true;
                        //使用した魂の削除
                        Spirits = UsedSpirits(Spirits, deadlyCost, spiritsLength, scene);
                    }
                }
            });

            //タップした場所を使った処理はここから
            scene.on(Event.TOUCH_END, function (endPos) {
                //ププボタンの場所で押してた場合
                if (tapObj == "pupuBtn") {
                    if ((tapPos.y - endPos.y) > pupuBtn.height / 2 * pupuBtn.scaleY) {
                        Flag = CostCheck(haveCost, PUPU, Flag);
                        if (Flag == "Succes")
                        {
                            haveCost = UseCost(haveCost, PUPU);
                            PushDemon(PUPU, pupuBtn, tapPos, endPos, myPlayerID);
                        }
                    }
                    else if ((tapPos.y - endPos.y) < -pupuBtn.height / 2 * pupuBtn.scaleY) {
                        Flag = CostCheck(haveCost, PUPU, Flag);
                        if (Flag == "Succes") {
                            haveCost = UseCost(haveCost, PUPU);
                            PushDemon(PUPU, pupuBtn, tapPos, endPos, myPlayerID);
                        }
                    }
                    else if ((tapPos.x - endPos.x) < -pupuBtn.height / 2 * pupuBtn.scaleX || (tapPos.x - endPos.x) > pupuBtn.height / 2 * pupuBtn.scaleX) {
                        Flag = CostCheck(haveCost, PUPU, Flag);
                        if (Flag == "Succes") {
                            haveCost = UseCost(haveCost, PUPU);
                            PushDemon(PUPU, pupuBtn, tapPos, endPos, myPlayerID);
                        }
                    }
                }
                    //ポポボタンの場所で押してた場合
                else if (tapObj == "popoBtn") {
                    if ((tapPos.y - endPos.y) > popoBtn.height / 2 * popoBtn.scaleY) {
                        Flag = CostCheck(haveCost, POPO, Flag);
                        if (Flag == "Succes")
                        {
                            haveCost = UseCost(haveCost, POPO);
                            PushDemon(POPO, popoBtn, tapPos, endPos, myPlayerID);
                        }
                    }
                    else if ((tapPos.y - endPos.y) < -popoBtn.height / 2 * popoBtn.scaleY) {
                        Flag = CostCheck(haveCost, POPO, Flag);
                        if (Flag == "Succes") {
                            haveCost = UseCost(haveCost, POPO);
                            PushDemon(POPO, popoBtn, tapPos, endPos, myPlayerID);
                        }
                    }
                    else if ((tapPos.x - endPos.x) < -popoBtn.height / 2 * popoBtn.scaleX || (tapPos.x - endPos.x) > popoBtn.height / 2 * popoBtn.scaleX) {
                        Flag = CostCheck(haveCost, POPO, Flag);
                        if (Flag == "Succes") {
                            haveCost = UseCost(haveCost, POPO);
                            PushDemon(POPO, popoBtn, tapPos, endPos, myPlayerID);
                        }
                    }
                }
                    //ピピボタンの場所で押してた場合
                else if (tapObj == "pipiBtn") {
                    if ((tapPos.y - endPos.y) > pipiBtn.height / 2 * pipiBtn.scaleY) {
                        Flag = CostCheck(haveCost, PIPI, Flag);
                        if (Flag == "Succes")
                        {
                            haveCost = UseCost(haveCost, PIPI);
                            PushDemon(PIPI, pipiBtn, tapPos, endPos, myPlayerID);
                        }
                    }
                    else if ((tapPos.y - endPos.y) < -pipiBtn.height / 2 * pipiBtn.scaleY) {
                        Flag = CostCheck(haveCost, PIPI, Flag);
                        if (Flag == "Succes") {
                            haveCost = UseCost(haveCost, PIPI);
                            PushDemon(PIPI, pipiBtn, tapPos, endPos, myPlayerID);
                        }
                    }
                    else if ((tapPos.x - endPos.x) < -pipiBtn.height / 2 * pipiBtn.scaleX || (tapPos.x - endPos.x) > pipiBtn.height / 2 * pipiBtn.scaleX) {
                        Flag = CostCheck(haveCost, PIPI, Flag);
                        if (Flag == "Succes") {
                            haveCost = UseCost(haveCost, PIPI);
                            PushDemon(PIPI, pipiBtn, tapPos, endPos, myPlayerID);
                        }
                    }
                }

                tapObj = null;
            });

            //矢印表示のためにここに処理
            scene.on(Event.TOUCH_MOVE, function (nowPos)
            {
                //ププボタンの場所で押してた場合
                if (tapObj == "pupuBtn") 
                {
                    ArrowSet(PUPU, pupuBtn, tapPos, nowPos, pupuBtn, core);
                }
                    //ポポボタンの場所で押してた場合
                else if (tapObj == "popoBtn") 
                {
                    ArrowSet(POPO, popoBtn, tapPos, nowPos, popoBtn, core);
                }
                    //ピピボタンの場所で押してた場合
                else if (tapObj == "pipiBtn") 
                {
                    ArrowSet(PIPI, pipiBtn, tapPos, nowPos, pipiBtn, core);
                }
            });

            ////////描画////////
            //オブジェクトに追加する処理(ここに入れたいオブジェクトを描画順に指定)
            /////////////背景/////////////
            scene.addChild(back);

            scene.addChild(pupuBtn);
            scene.addChild(popoBtn);
            scene.addChild(pipiBtn);
            scene.addChild(deadlyBtn);

            scene.addChild(PowerUpBack);

            scene.addChild(PUPUPowerUpButton);
            scene.addChild(POPOPowerUpButton);
            scene.addChild(PIPIPowerUpButton);

            scene.addChild(ponpu);

            scene.addChild(PUPU_UI);
            scene.addChild(POPO_UI);
            scene.addChild(PIPI_UI);

            scene.addChild(PUPUicon);
            scene.addChild(POPOicon);
            scene.addChild(PIPIicon);

            scene.addChild(PUPULv);
            scene.addChild(POPOLv);
            scene.addChild(PIPILv);

            //魂の受け取り&描画処理
            socket.on("SpiritPushed", function (SpiritData) {
                var _PlayerID = parseInt(SpiritData.PlayerID.toString());

                if (_PlayerID == myPlayerID) {
                    for (var i = 0; i < spiritsLength; i++) {
                        if (Spirits[i] == null) {
                            Spirits[i] = new Spirit(SpiritData.Type, SpiritData.PlayerID, core);
                            scene.addChild(Spirits[i].Sprite);
                            break;
                        }
                    }
                }
            });

            //フォント
            scene.addChild(CPFont);
            scene.addChild(PUPUCostFont);
            scene.addChild(POPOCostFont);
            scene.addChild(PIPICostFont);

            //所持コストのフォント
            for (var i = 0; i < costDigit; i++)
            {
                scene.addChild(costFont[i]);
            }

            //悪魔の必要コストフォント
            for (var i = 0; i < DemoncostDigit; i++)
            {
                scene.addChild(PUPUcostFont[i]);
                scene.addChild(POPOcostFont[i]);
                scene.addChild(PIPIcostFont[i]);
            }

            for (var i = 0; i < DemonLevelDigit; i++)
            {
                scene.addChild(PUPULevelFont[i]);
                scene.addChild(POPOLevelFont[i]);
                scene.addChild(PIPILevelFont[i]);
            }

            //各悪魔のステータス

            scene.addChild(weakPattern);

            /////////////前面/////////////
            //scene.addChild(FPSlbl);
            return scene;
        };

//////////////////////////リザルトシーン//////////////////////////////////////////////////////////////////////////////
        var ResultScene = function ()
        {
            var scene = new Scene();

            core.frame = 0;

            ////////画像情報処理////////
            //背景
            var resultBack = new Sprite(1280, 720);
            resultBack.image = core.assets['matchingUI/otu.png'];
            resultBack.scale(1, 1);
            resultBack.x = 0;
            resultBack.y = 0;

            var tapRequest = new Sprite(1280, 200);
            tapRequest.image = core.assets['matchingUI/game_end_tap.png'];
            tapRequest.x = core.width / 2 - tapRequest.width / 2;
            tapRequest.y = 500;

            scene.addChild(resultBack);
            scene.addChild(tapRequest);

            scene.addEventListener(Event.TOUCH_START, function ()
            {
                if (core.frame > core.fps * 1.5)
                {
                    socket.emit("PhoneFinalEnd");
                    window.location.reload();
                }     
            });

            return scene;
        };

//////////////////////////ポーズシーン//////////////////////////////////////////////////////////////////////////////
        var PauseScene = function ()
        {
            var scene = new Scene();

            ////////画像情報処理////////
            //背景
            var pauseUI = new Sprite(1024, 256);
            pauseUI.image = core.assets['matchingUI/see_mo.png'];
            pauseUI.scale(1, 1);
            pauseUI.x = core.width / 2 - pauseUI.width / 2;
            pauseUI.y = core.height / 2 - pauseUI.height / 2;

            scene.addChild(pauseUI);

            scene.backgroundColor = 'rgba(0,0,0,0.5)';

            //ゲーム終了を受け取ってリザルト画面へ移行
            socket.on("PushGameEndRequest", function () {
                core.replaceScene(ResultScene());
            });

            socket.on("PushStopEndRequest", function ()
            {
                if (stoppingFlag)
                {
                    stoppingFlag = false;
                    core.popScene();
                }
            });

            if (!stoppingFlag)
            {
                //秒間コストを受け取り
                socket.on("PushSecondCost", function (CostData)
                {
                    var intCost = parseInt(CostData.Cost.toString());
                    if (haveCost < MaxCost) {
                        haveCost += intCost;
                    }
                    else {
                        haveCost = MaxCost;
                    }
                });
            }

            return scene;
        };

        //////////////////////////シーンの読み込み//////////////////////////
        core.replaceScene(TitleScene());

    }
    core.start();
};

/////////////////クラス/////////////////
//デーモンクラス
function Demon(Type, Direction, Level, PlayerID, BaseCost, Cost, HP, ATK, SPEED){
    this.Type = Type;
    this.Direction = Direction;
    this.Level = Level;
    this.PlayerID = PlayerID;
    this.BaseCost = BaseCost;
    this.Cost = Cost;
    this.HP = HP;
    this.ATK = ATK;
    this.SPEED = SPEED;
}
//座標取得クラス
function TapPos(x, y) {
    this.x = x;
    this.y = y;
}
//スピリットクラス
function Spirit(Type, PlayerID, core)
{
    this.Type = Type;
    this.PlayerID = PlayerID;
    this.Sprite = new Sprite(600, 600);
    if (this.Type == "PUPU")
    {
        this.Sprite.image = core.assets['img/pupu_soul.png'];
    }
    else if (this.Type == "POPO")
    {
        this.Sprite.image = core.assets['img/pupu_soul.png'];
    }
    else if (this.Type == "PIPI")
    {
        this.Sprite.image = core.assets['img/pupu_soul.png'];
    }

    this.Sprite.scale(0.1, 0.1);

    this.Sprite.x = Math.floor(Math.random() * 200)  - 100;
    this.Sprite.y = Math.floor(Math.random() * 50) + 100;    
}

/////////////////関数/////////////////
function FontSet(_Cost, Digit, Sprite)
{
    if (Digit == 3) {
        Sprite.frame = _Cost / 1000;
    }
    else if (Digit == 2) {
        Sprite.frame = (_Cost % 1000) / 100;
    }
    else if (Digit == 1) {
        Sprite.frame = (_Cost % 100) / 10;
    }
    else if (Digit == 0) {
        Sprite.frame = _Cost % 10;
    }

    return Sprite;
}

//デーモンの初期化
function InitializeDemon(Demon, defaultDemon)
{
    Demon = defaultDemon;

    return Demon;
}

function InitializeCost(haveCost, defaulthaveCost)
{
    haveCost = defaulthaveCost;

    return haveCost;
}

function InitializeMaxCost(MaxCost, defaultMaxCost)
{
    MaxCost = defaultMaxCost;

    return defaultMaxCost;
}

//コストが使えるかの確認
function CostCheck(_haveCost, _demon, _Flag)
{
    if (_haveCost - (_demon.Cost) >= 0) {
        _Flag = "Succes";
    }
    else {
        _Flag = "Faild";
        console.log("Faild");
    }
    return _Flag;
}

//コスト消費
function UseCost(_haveCost, _demon)
{
    if (_haveCost - _demon.Cost >= 0)
    {
        _haveCost -= _demon.Cost;
    }
    return _haveCost;
}

//スピリットが足りてるかの確認
function SpiritCheck(_Spirits, _Cost, Length)
{
    var countSpirit = 0;
    for(var i = 0; i < Length; i++)
    {
        //ここでスピリットデータがあるかの確認をする。
        if (_Spirits[i] != null)
        {
            countSpirit += 1;
        }
    }
    //スピリット量が必殺技コストより多い場合trueを返す
    if (countSpirit >= _Cost)
    {
        return true;
    }
    else
    {
        return false;
    }
}

//スピリット消費
function UsedSpirits(_Spirits, _Cost, Length, scene)
{
    var count = 0;

    for (var i = 0; i < Length; i++)
    {
        if(_Spirits[i] != null)
        {
            scene.removeChild(_Spirits[i].Sprite);
            _Spirits[i] = null;
            count += 1;
            if (count >= _Cost)
                break;
        }
    }

    return _Spirits;
}

//悪魔の強化
function PowerUp(Demon)
{
    Demon.Level += 1;
    Demon.Cost = Demon.BaseCost + Demon.Level * 5;

    return Demon;
}

//矢印の方向指定
function ArrowSet(demon, btn, startPos, endPos, Arrow, core)
{
    //座標の移動幅を見て方向指定
    //上方向時
    if ((startPos.y - endPos.y) > btn.height / 2 * btn.scaleY)
    {
        if (demon.Type == "PUPU")
        {
            switch (myPlayerID) {
                case 0:
                    Arrow.image = core.assets['button/1p_red_ue.png'];
                case 1:
                    Arrow.image = core.assets['button/2p_red_ue.png'];
            }
        }
        else if(demon.Type == "POPO")
        {
            switch (myPlayerID) {
                case 0:
                    Arrow.image = core.assets['button/1p_green_ue.png'];
                case 1:
                    Arrow.image = core.assets['button/2p_green_ue.png'];
            }
        }
        else if(demon.Type == "PIPI")
        {
            switch (myPlayerID) {
                case 0:
                    Arrow.image = core.assets['button/1p_blue_ue.png'];
                case 1:
                    Arrow.image = core.assets['button/2p_blue_ue.png'];
            }
        }    
    }
    //下方向時
    else if ((startPos.y - endPos.y) < -btn.height / 2 * btn.scaleY)
    {
        if (demon.Type == "PUPU") {
            switch (myPlayerID) {
                case 0:
                    Arrow.image = core.assets['button/1p_red_sita.png'];
                case 1:
                    Arrow.image = core.assets['button/2p_red_sita.png'];
            }
        }
        else if (demon.Type == "POPO") {
            switch (myPlayerID) {
                case 0:
                    Arrow.image = core.assets['button/1p_green_sita.png'];
                case 1:
                    Arrow.image = core.assets['button/2p_green_sita.png'];
            }
        }
        else if (demon.Type == "PIPI") {
            switch (myPlayerID) {
                case 0:
                    Arrow.image = core.assets['button/1p_blue_sita.png'];
                case 1:
                    Arrow.image = core.assets['button/2p_blue_sita.png'];
            }
        }
    }
    //右方向時
    else if ((startPos.x - endPos.x) < -btn.height / 2 * btn.scaleX)
    {
        if (demon.Type == "PUPU") {
            switch (myPlayerID) {
                case 0:
                    Arrow.image = core.assets['button/1p_red_migi.png'];
                case 1:
                    Arrow.image = core.assets['button/2p_red_hidari.png'];
            }
        }
        else if (demon.Type == "POPO") {
            switch (myPlayerID) {
                case 0:
                    Arrow.image = core.assets['button/1p_green_migi.png'];
                case 1:
                    Arrow.image = core.assets['button/2p_green_hidari.png'];
            }
        }
        else if (demon.Type == "PIPI") {
            switch (myPlayerID) {
                case 0:
                    Arrow.image = core.assets['button/1p_blue_migi.png'];
                case 1:
                    Arrow.image = core.assets['button/2p_blue_hidari.png'];
            }
        }
    }
    //左方向時
    else if ((startPos.x - endPos.x) > btn.height / 2 * btn.scaleX)
    {
        if (demon.Type == "PUPU") {
            switch (myPlayerID) {
                case 0:
                    Arrow.image = core.assets['button/1p_red_migi.png'];
                case 1:
                    Arrow.image = core.assets['button/2p_red_hidari.png'];
            }
        }
        else if (demon.Type == "POPO") {
            switch (myPlayerID) {
                case 0:
                    Arrow.image = core.assets['button/1p_green_migi.png'];
                case 1:
                    Arrow.image = core.assets['button/2p_green_hidari.png'];
            }
        }
        else if (demon.Type == "PIPI") {
            switch (myPlayerID) {
                case 0:
                    Arrow.image = core.assets['button/1p_blue_migi.png'];
                case 1:
                    Arrow.image = core.assets['button/2p_blue_hidari.png'];
            }
        }
    }

    return Arrow;
}

//デーモンの送信
function PushDemon(demon, btn, startPos, endPos, setPlayerID)
{
    //座標の移動幅を見て方向指定
    if ((startPos.y - endPos.y) > btn.height / 2 * btn.scaleY) {
        demon.Direction = "Top";
    }
    else if ((startPos.y - endPos.y) < -btn.height / 2 * btn.scaleY) {
        demon.Direction = "Bottom";
    }
    else if ((startPos.x - endPos.x) < -btn.height / 2 * btn.scaleX || (startPos.x - endPos.x) > btn.height / 2 * btn.scaleX) {
        demon.Direction = "Middle";
    }
    else {
        demon.Direction = "None";
    }
    //プレイヤーID設定
    demon.PlayerID = setPlayerID;

    //データ送信
    if (demon.Direction != "None")
        socket.emit("DemonPush", { Type: demon.Type, Direction: demon.Direction, Level: demon.Level, PlayerID: demon.PlayerID });

    //ログ出力
    console.log(demon.Type);
    console.log(demon.Direction);
    console.log(demon.Level);
    console.log(demon.PlayerID);
}

//必殺技送信
function PushDeadly(setPlayerID)
{
    socket.emit("DeadlyPush", { Deadly: "Fire", PlayerID: setPlayerID});
    console.log("DeadlyPushed");
}

//エラー時アラートが呼び出されるように
window.onerror = function(error)
{
    alert(error);
}
