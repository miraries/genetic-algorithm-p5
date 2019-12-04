class GA {
    constructor() {
        this.cities = []
        this.population = []
        this.fitness = []
        this.bestDistance = Infinity
        this.totalBest = []
        this.currentBest = []
        this.mutationRate = 0.01
        this.generationCounter = 0
        this.fitnessHistory = ['Fitness']
    }

    generateRandomCities(citiesSize) {
        for (let i = 0; i < citiesSize; i++) {
            let v = createVector(random(width / 2), random(height / 2))
            this.cities[i] = v
        }
    }

    generateRandomPopulation(populationSize) {
        const order = [...Array(this.cities.length).keys()]

        for (let i = 0; i < populationSize; i++) {
            this.population[i] = shuffle(order)
        }
    }

    drawTotalBest() {
        stroke(0)
        strokeWeight(4)
        noFill()
        for (let i = 0; i < this.totalBest.length; i++) {
            const n = this.totalBest[i]
            const nNext = this.totalBest[i + 1]
            const color = map(i, 0, this.totalBest.length, 0, 255)
            stroke(color, 255 - color, color)
            if(nNext)
                line(this.cities[n].x, this.cities[n].y, this.cities[nNext].x, this.cities[nNext].y)
            ellipse(this.cities[n].x, this.cities[n].y, 16, 16)
        }
    }

    drawCurrentBest() {
        translate(0, height / 2)
        stroke(0)
        strokeWeight(4)
        noFill()
        for (let i = 0; i < this.currentBest.length; i++) {
            const n = this.currentBest[i]
            const nNext = this.currentBest[i + 1]
            const color = map(i, 0, this.currentBest.length, 0, 255)
            stroke(color, 255 - color, color)
            if (nNext)
                line(this.cities[n].x, this.cities[n].y, this.cities[nNext].x, this.cities[nNext].y)
            ellipse(this.cities[n].x, this.cities[n].y, 16, 16)
        }
    }

    updateGui() {
        this.mutationRate = sliderMutation ? sliderMutation.value() / 10000 : 0.01
        frameRate(sliderFramerate ? sliderFramerate.value() : 60)
        strokeWeight(0)
        textStyle(BOLD)
        textSize(24)
        fill(0)
        translate(width / 2 + 50, - height / 2)
        text(`Generation: ${this.generationCounter}`, 50, 50)
        text(`Record distance: ${floor(this.bestDistance)}`, 50, 80)
        text(`Mutation rate: ${this.mutationRate}`, 50, 110)
        text(`Cities size: ${this.cities.length}`, 50, 140)
        text(`Population size: ${this.population.length}`, 50, 170)
        text(`Framerate: ${round(frameRate())}`, 50, 200)
    }

    static calculatePointDistance(p, q) {
        return sqrt((p.x - q.x) * (p.x - q.x) + (p.y - q.y) * (p.y - q.y))
    }

    static calculatePathDistance(points, order) {
        let sum = 0

        for (let i = 0; i < order.length - 1; i++) {
            const cityA = points[order[i]]
            const cityB = points[order[i + 1]]
            const d = this.calculatePointDistance(cityA, cityB)
            sum += d
        }

        return sum
    }

    calculateFitness() {
        let currentBestDistance = Infinity

        for (let i = 0; i < this.population.length; i++) {
            const distance = GA.calculatePathDistance(this.cities, this.population[i])

            if (distance < this.bestDistance) {
                this.bestDistance = distance
                this.totalBest = this.population[i]
            }
            if (distance < currentBestDistance) {
                currentBestDistance = distance
                this.currentBest = this.population[i]
            }

            // TODO: Examine
            this.fitness[i] = 1 / (pow(distance, 8) + 1)
        }

        this.logFitness()
    }

    logFitness() {
        if (this.generationCounter % 20 !== 0)
            return

        this.fitnessHistory.push(max(this.fitness))
        chart.load({
            columns: [this.fitnessHistory]
        })
    }

    normalizeFitness() {
        let sum = this.fitness.reduce((a, b) => a + b)

        this.fitness = this.fitness.map(f => f / sum)
    }

    regenerate() {
        let newPopulation = []
        for (let i = 0; i < this.population.length; i++) {
            const orderA = this.pickOne()
            const orderB = this.pickOne()
            let order = GA.crossOver(orderA, orderB)
            this.mutate3(order)
            newPopulation[i] = order
        }
        this.population = newPopulation
        this.generationCounter++
    }

    static crossOver(orderA, orderB) {
        const start = floor(random(orderA.length))
        const end = floor(random(start + 1, orderA.length))
        const childOrder = orderA.slice(start, end)

        for (let i = 0; i < orderB.length; i++) {
            const cityIndex = orderB[i]
            if (!childOrder.includes(cityIndex)) {
                childOrder.push(cityIndex)
            }
        }

        return childOrder
    }

    static mutate(order) {
        for (let i = 0; i < order.length; i++) {
            if (random(1) < this.mutationRate) {
                const i1 = floor(random(order.length))
                const i2 = (i1 + 1) % totalCities // handle overflow
                swap(order, i1, i2)
            }
        }
    }

    mutate2(order) {
        let index1, index2

        if (random(1) > this.mutationRate)
            return

        do {
            index1 = floor(random(0, order.length - 2))
            index2 = floor(random(0, order.length))
        } while (index1 > index2) {
            const part1 = order.slice(0, index1)
            const part2 = order.slice(index1, index2)
            const part3 = order.slice(index2, order.length)
            order = part2.concat(part1).concat(part3)
        }
    }

    mutate3(order) {
        if (random(1) > this.mutationRate)
            return

        for (let i = 0; i < floor(random(5)); i++) {
            const index1 = floor(random(0, order.length - 2))
            const index2 = floor(random(0, order.length))
            const part1 = order.slice(0, index1)
            const part2 = order.slice(index1, index2)
            const part3 = order.slice(index2, order.length)

            order = random([0, 1]) ? part2.concat(part1).concat(part3) : part1.concat(part3).concat(part2)
        }
    }

    static swap(a, i, j) {
        const temp = a[i]
        a[i] = a[j]
        a[j] = temp
    }

    // Some probability magic
    pickOne() {
        let index = 0
        let r = random(1)

        while (r > 0) {
            r = r - this.fitness[index]
            index++
        }
        index--

        return this.population[index].slice()
    }

    pickOne2(index) {
        const fitnessClone = this.fitness
        const sorted = fitnessClone.sort(function (a, b) { return b - a })
        for (let i = 0; i < this.population.length; i++) {
            if (fitnessClone[i] == sorted[index])
                return this.population[i]
        }
    }
}
