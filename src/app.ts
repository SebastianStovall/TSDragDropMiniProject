// this will be done with an OOP approach since were not using a framework like react

// class ProjectList   ------> reaches out to the <template></template> that holds the <section> <header><ul> <section>. This is where ALL projects will be displayed/rendered
// class ProjectInput  ------> reaches out to the <template></template> that holds the <form></form> to submit a new project. It handles logic for submitting and validating a new project through this form








// DISPLAYING ALL PROJECTS LIST ----------------------------------------------------------------------------------------------------------------------------------- //



// ---------------------------------------------------------------------------------------------------------------------------------------------------------------








// SETTING UP THE FORM (TEMPLATE & LOGIC)  ----------------------------------------------------------------------------------------------------------------------- //

// the ProjectInput class is essentially just building out the <template></template> on the index HTML, and then handling logic/validation for the form:
// <template id="project-input">  <---- templateElement
//    <form>         <---- element
//     [...] <-- inputElements
//    </form>
// </template>
// <div id="app"></div>   <---- hostElement (where our content will eventually be rendered)


// object passing into validate() for form validation
interface Validatable {     // define structure for a validatableInput object
    value: string | number
    required?: boolean       // make all validations optional '?' since we dont know which inputs will require what validations
    minLength?: number       // minLength/maxLength for STRINGS
    maxLength?: number
    min?: number             // min/max for NUMBERS
    max?: number
}

// validates userInput from form submission
function validate(validatableInput: Validatable) {
    let isValid = true

    if(validatableInput.required) {
        isValid = isValid && validatableInput.value.toString().trim().length !== 0
    }
    if(validatableInput.minLength != null && typeof validatableInput.value === 'string') {   // when doing ( != null ) ---> that means null OR undefined
        isValid = isValid && validatableInput.value.length >= validatableInput.minLength
    }
    if(validatableInput.maxLength != null && typeof validatableInput.value === 'string') {   // when doing ( != null ) ---> that means null OR undefined
        isValid = isValid && validatableInput.value.length >= validatableInput.maxLength
    }
    if(validatableInput.min != null && typeof validatableInput.value === 'number') {
        isValid = isValid && validatableInput.value >= validatableInput.min
    }
    if(validatableInput.max != null && typeof validatableInput.value === 'number') {
        isValid = isValid && validatableInput.value <= validatableInput.max
    }

    return isValid
}


// this @AutoBind decorator will be used to bind the context of the addEventListener when submitting the template form
function Autobind(_: any, _2: string, descriptor: PropertyDescriptor) {        // originally took in  -----> target: any, methodName: string, descriptor: PropertyDescriptor ... but changed the names of the values because we were not using them
    const ogMethod = descriptor.value  // grab the method this decorated is tied to
    const adjustedDescriptor: PropertyDescriptor = {  // replace the old method descriptor (and return it)
        configurable: true,
        enumerable: false,
        get() {
            const boundFunction = ogMethod.bind(this)  // !!! Bind the context of the original method to the instance of the class. (so context can be maintained when being used with other methods... such as addEventListener) !!!
            return boundFunction
        }
    }
    return adjustedDescriptor
}



class ProjectInput {
    templateElement: HTMLTemplateElement  // <template> tag... (used to hold client-side content that you don't want to be rendered when a page loads)
    hostElement: HTMLDivElement // output will eventually be rendered in the app <div>
    element: HTMLFormElement // this is the <form></form> rendered in the <template></template>
    titleInputElement: HTMLInputElement                                                             // input tag on line 16 in index HTML
    descriptionInputElement: HTMLInputElement                                                       // textarea tag on line 20 in index HTML
    peopleInputElement: HTMLInputElement                                                            // input tag on line 24 in index HTML

    constructor() {
        this.templateElement = document.getElementById('project-input')! as HTMLTemplateElement // gives access to the template that holds hostElement (must typecast to HTMLTemplateElement so TS knows your grabbing such an element. Otherwise TS just knows its a regular HTML element which might not have the properties its looking for)
        this.hostElement = document.getElementById('app')! as HTMLDivElement  // the element where we want the content to be eventually rendered in the HTML

        // this is the imported HTML content of the templateElement (node includes a HTML tag and its content)
        const importedNode = document.importNode(this.templateElement.content, true)
        this.element = importedNode.firstElementChild as HTMLFormElement
        this.element.id = 'user-input'  // apply the .user-input in the app.css

        this.titleInputElement = this.element.querySelector('#title') as HTMLInputElement  // Returns the first matching element that is a descendant of the form node
        this.descriptionInputElement = this.element.querySelector('#description') as HTMLInputElement  // Returns the first matching element that is a descendant of the form node
        this.peopleInputElement = this.element.querySelector('#people') as HTMLInputElement  // Returns the first matching element that is a descendant of the form node


        // sets up the necessary template + logic in the constructor by calling our methods, so its ready to go when an instance is created
        this.configure()
        this.attach()
    }


    private gatherUserInput(): [string, string, number] | void {  // get all userInput fields and return them so they can be used in the submitHandler (returns a Tuple)
        const enteredTitle = this.titleInputElement.value
        const enteredDescription = this.descriptionInputElement.value
        const enteredPeople = this.peopleInputElement.value

        const titleValidatable: Validatable = {
            value: enteredTitle,
            required: true
        }

        const descriptionValidatable: Validatable = {
            value: enteredDescription,
            required: true,
            minLength: 5
        }

        const peopleValidatable: Validatable = {
            value: parseFloat(enteredPeople),
            required: true,
            min: 1,
            max: 5
        }

        if (
            !validate(titleValidatable) ||
            !validate(descriptionValidatable) ||
            !validate(peopleValidatable)
        ) {
            alert('Invalid input, please try again!')   // if any validations fail, return an alert
        } else {
            return [enteredTitle, enteredDescription, +enteredPeople]  // return userInput is all validation checks were passed
        }

    }

    private clearInputs() {
        this.titleInputElement.value = ''
        this.descriptionInputElement.value = ''
        this.peopleInputElement.value = ''
    }


    @Autobind // will now retain context when entering submitHandler method
    private submitHandler(e: Event) { // sets up the logic for validating & creating a project on form submission
        e.preventDefault()
        // console.log(this.titleInputElement.value) // when first setting this method up, 'this' context is lost when entering trying to access the value here. Two work-arounds for this ---> 1.) setting up an @AutoBind decorator   2.) bind 'this' context before entering this method

        const userInput = this.gatherUserInput()
        if( Array.isArray(userInput) ) { // checks if you got a tuple back from userInput (valid input!)
            const [title, desc, people] = userInput
            console.log(title, desc, people)
            this.clearInputs() // clear form on a successful submission
        }

    }

    private configure() { // attach's an addEventListener to the <form></form> so we can submit
        this.element.addEventListener('submit', this.submitHandler)  // when the form is submitted, execute the logic inside submitHandler() method  !!! (if you dont want to create an @AutoBind decorator... you could simply just use the bind method and bind 'this' context when entering the submitHandler like this -----> this.submitHandler.bind(this) ) !!!
    }

    private attach() {
        this.hostElement.insertAdjacentElement('afterbegin', this.element);
    }
}

// creating an instance of this class will generate you the form for creating a new project
const projectInputForm = new ProjectInput()


//  ----------------------------------------------------------------------------------------------------------------------- //
