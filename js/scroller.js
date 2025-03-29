const circleButtons = document.querySelectorAll('.circle-button');
const sections = document.querySelectorAll('.page-section');
const totalHeight = document.documentElement.scrollHeight;


circleButtons.forEach((button, index) => {
    button.addEventListener('click', function() {
        let targetTop;
        targetTop = Math.max(0, sections[index].offsetTop);

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
            let nextSectionTop = (index < sections.length) ? sections[index + 1].offsetTop - windowHeight / 2 : totalHeight;
            if (scrollTop >= section.offsetTop - windowHeight / 2 && scrollTop < nextSectionTop) {
                circleButtons[index].classList.add('selected'); 
            }
        });
    }
});