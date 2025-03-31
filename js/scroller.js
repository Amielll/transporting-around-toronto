import * as d3 from "d3";

const sections = document.querySelectorAll('.page-section');
const totalHeight = document.documentElement.scrollHeight;
let selected = 0;


const buttonNav = d3.select("#scroller-buttons");
sections.forEach((section, index) => {
    let button = buttonNav.append("li")

    if (index == 0){
        button.attr("class", "circle-button selected")
    } else {
        button.attr("class", "circle-button")
    }
}) 


const circleButtons = document.querySelectorAll('.circle-button');

circleButtons.forEach((button, index) => {
    button.addEventListener('click', function() {
        let targetTop;
        targetTop = Math.max(0, sections[index].offsetTop);
        selected = index;

        window.scrollTo({
            top: targetTop,
            behavior: 'smooth'
        });
    });
});

function unselectButtons() {
    circleButtons.forEach(button => {
        button.classList.remove('selected');
    });
}

window.addEventListener('scroll', function(){
    const windowHeight = window.innerHeight;
    const scrollTop = window.scrollY;

    unselectButtons();

    if (scrollTop <= sections[0].offsetTop - windowHeight / 2) {
        circleButtons[0].classList.add('selected');
    } else {
        sections.forEach((section, index) => {
            let nextSectionTop = (index < sections.length - 1) ? sections[index + 1].offsetTop - windowHeight / 2 : totalHeight;
            if (scrollTop >= section.offsetTop - windowHeight / 2 && scrollTop < nextSectionTop) {
                circleButtons[index].classList.add('selected'); 
                selected = index;
            }
        });
    }
});

document.addEventListener('keyup', function(event) {
    if (event.key === "ArrowDown"){
        if (selected + 1 < sections.length){
            selected += 1;
            changePage(selected);
        }
    } else if (event.key === "ArrowUp"){
        if (selected - 1 >= 0){
            selected -= 1;
            changePage(selected);
        }
    } 
});

function changePage(index){
    let targetTop;
        targetTop = Math.max(0, sections[index].offsetTop);

        window.scrollTo({
            top: targetTop,
            behavior: 'smooth'
        });
}