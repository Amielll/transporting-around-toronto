import {DataManager} from "../util/dataManager.js";
import {ScoreBarVis} from "../scoreBarVis.js"
import * as d3 from "d3";

export class CitiesScoreController {
    constructor() {
    }

    initController() {
        let data = new DataManager().data;
        let scoresData = data.bnaScores;
        this.barVis = new ScoreBarVis('city-scores-vis', scoresData);
    }
}