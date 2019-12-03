
const gaInstance = new GA()
let chart

function setup() {
    noLoop()
    let canvas = createCanvas(1000, 800);
    canvas.parent('sketch-holder')

    gaInstance.generateRandomCities(60)
    gaInstance.generateRandomPopulation(500)
    setupGui()

    chart = c3.generate({
        bindto: '#chart',
        data: {
            columns: [
                ['Fitness',0]
            ]
        },
        axis: {
            x: {
                show: false
            },
            y: {
                show: false
            }
        }
    });
}

function draw() {
    background(255)

    gaInstance.calculateFitness()
    gaInstance.normalizeFitness()
    gaInstance.regenerate()

    gaInstance.drawTotalBest()
    gaInstance.drawCurrentBest()
    gaInstance.updateGui()
}