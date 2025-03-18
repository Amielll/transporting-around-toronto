import * as d3 from "d3";

let curr_page = 1;

d3.selectAll(".circle-button").on("click", (event) => {
    let sectionNumber = event.srcElement.id.replace("button-", "");
    changePage(sectionNumber);
});

document.addEventListener("keydown", function(e) {
    if(["Space","ArrowUp","ArrowDown","ArrowLeft","ArrowRight"].indexOf(e.code) > -1) {
        e.preventDefault();
    }
}, false);

document.addEventListener('keyup', function(event) {
    if (event.key === "ArrowDown"){
        if (curr_page + 1 <= 6)
            changePage(curr_page + 1);
    } else if (event.key === "ArrowUp"){
        if (curr_page - 1 >= 0)
            changePage(curr_page - 1);
    } 
});

document.addEventListener('keyup', function(event) {
    if (event.key === "ArrowDown"){
        if (curr_page + 1 <= 6)
            changePage(curr_page + 1);
    } else if (event.key === "ArrowUp"){
        if (curr_page - 1 >= 0)
            changePage(curr_page - 1);
    } 
});

function changePage(sectionNumber){
    d3.selectAll(".circle-button").style("background-color", "white");
    d3.select(`#button-${sectionNumber}`).style("background-color", "black");

    let section = document.getElementById(`section-${sectionNumber}`);
    section.scrollIntoView()

    curr_page = sectionNumber;
}
