import { ANSI } from "./utils/ansi.mjs";
import { print, clearScreen } from "./utils/io.mjs";
import SplashScreen from "./game/splash.mjs";
import { FIRST_PLAYER, SECOND_PLAYER } from "./consts.mjs";
import createMenu from "./utils/menu.mjs";
import createMapLayoutScreen from "./game/mapLayoutScreen.mjs";
import createInnBetweenScreen from "./game/innbetweenScreen.mjs";
import createBattleshipScreen from "./game/battleshipsScreen.mjs";
import translations from "./utils/localisation.mjs";

let language = "en"; // Default language
const GAME_FPS = 1000 / 60;
let currentState = null;
let gameLoop = null;
let mainMenuScene = null;

const MIN_WIDTH = 80;
const MIN_HEIGHT = 24;

function translate(key) {
    return translations[language][key];
}

(function initialize() {
    clearScreen();
    print("Choose language / Velg språk: [1] English, [2] Norsk: ");
    process.stdin.once("data", (data) => {
        const choice = data.toString().trim();
        if (choice === "2") language = "no";
        
        if (process.stdout.columns < MIN_WIDTH || process.stdout.rows < MIN_HEIGHT) {
            print(
                translate("consoleTooSmall")
                    .replace("{width}", MIN_WIDTH)
                    .replace("{height}", MIN_HEIGHT)
            );
            process.exit(1);
        }

        print(ANSI.HIDE_CURSOR);
        clearScreen();
        mainMenuScene = createMenu(buildMenu());
        SplashScreen.next = mainMenuScene;
        currentState = SplashScreen;
        gameLoop = setInterval(update, GAME_FPS);
    });
})();

function update() {
    currentState.update(GAME_FPS);
    currentState.draw(GAME_FPS);
    if (currentState.transitionTo != null) {
        currentState = currentState.next;
        print(ANSI.CLEAR_SCREEN, ANSI.CURSOR_HOME);
    }
}

function buildMenu() {
    let menuItemCount = 0;
    return [
        {
            text: translate("startGame"),
            id: menuItemCount++,
            action: function () {
                clearScreen();
                let innbetween = createInnBetweenScreen();
                innbetween.init(translate("shipPlacement") + "\n" + translate("firstPlayerPrompt"), () => {
                    let p1map = createMapLayoutScreen();
                    p1map.init(FIRST_PLAYER, (player1ShipMap) => {
                        let innbetween = createInnBetweenScreen();
                        innbetween.init(translate("shipPlacement") + "\n" + translate("secondPlayerPrompt"), () => {
                            let p2map = createMapLayoutScreen();
                            p2map.init(SECOND_PLAYER, (player2ShipMap) => {
                                return createBattleshipScreen(player1ShipMap, player2ShipMap);
                            });
                            return p2map;
                        });
                        return innbetween;
                    });
                    return p1map;
                }, 3);
                currentState.next = innbetween;
                currentState.transitionTo = "Map layout";
            },
        },
        {
            text: translate("exitGame"),
            id: menuItemCount++,
            action: function () {
                print(ANSI.SHOW_CURSOR);
                clearScreen();
                process.exit();
            },
        },
    ];
}
