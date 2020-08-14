class Utils {
    static getDublicateElements(elements) {
        return elements.filter((value, index, self) => (self.indexOf(value) !== index))
    }
}

export default Utils
