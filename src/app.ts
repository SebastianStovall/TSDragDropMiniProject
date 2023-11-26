// this will be done with an OOP approach since were not using a framework like react


// class ProjectList   ------> reaches out to the <template id='project-LIST'></template> that holds the <section></section> tag. This is where ALL projects will be displayed/rendered
// class ProjectInput  ------> reaches out to the <template id='project-INPUT></template> that holds the <form></form> to submit a new project. It handles logic for submitting and validating a new project through this form
// class ProjectState  ------> manages global state when adding/editing/deleting projects
// class Project       ------> defines the structure of a Project object



// PROJECT CLASS -----------------------------------------------------------------------------------------------------------------------------------------------------//

enum ProjectStatus { // !! USED FOR HANDLING WHAT LIST IT SHOULD BE RENDERED TO
    Active,
    Finished
}

class Project {
    constructor(
        public id: string,
        public title: string,
        public description: string,
        public people: number,
        public status: ProjectStatus) {     // !! USED FOR HANDLING WHAT LIST IT SHOULD BE RENDERED TO
    }
}


// ------------------------------------------------------------------------------------------------------------------------------------------------------------------//








// APP STATE MANAGEMENT --------------------------------------------------------------------------------------------------------------------------------------------//

type Listener = (items: Project[]) => void // define structure of a listener function (each listener function should take in an array of project objects, and return void)

class ProjectState {   // this class will handle global state for our projects

    private listeners: Listener[] = [] // an array of listener functions
    private projects: Project[] = []  // if this were Redux, this would essentially act as your store, and the methods would be reducer actions
    private static instance: ProjectState

    private constructor() {

    }

    // make this a singleton class... we will only ever need one instance for state management since we want a SINGLE SOURCE OF TRUTH
    static getInstance() {
        if (this.instance) {
            return this.instance
        } else {
            this.instance = new ProjectState()
            return this.instance
        }
    }


    // when calling projectState.addListener, it is both defining a listener that gets stored in the ProjectState but also updates
    // assignedProjects variable inside of the ProjectList class to be what the listner function gets invoked with when its called in
    // addProject with listenerFn(this.projects.slice()). The projects are then rendered with ProjectLists's renderProjects() method
    addListener(listenerFn: Listener) {
        this.listeners.push(listenerFn)
    }

    // this method will invoke on successful submission of a new project. It creates the project, then calls out to any listners (like the one in ProjectList class, to display the new list)
    addProject(title: string, description: string, numOfPeople: number) {
        const newProject = new Project(
            Math.random().toString(),
            title,
            description,
            numOfPeople,
            ProjectStatus.Active  // by default, all newly created projects will have an active status
        )
        this.projects.push(newProject)
        for (const listenerFn of this.listeners) {  // call all listener functions, or any methods that get called from listener function... such as ProjectList's renderProjects() method
            listenerFn(this.projects.slice())
        }
    }
}

//                  by calling ProjectState.getInstance(), we are now guarenteed to be working with the exact same object at all times
const projectState = ProjectState.getInstance()  // global constant that can be used anywhere in our application to manage our project state. All we need to do now is just talk to our projectState variable

// -----------------------------------------------------------------------------------------------------------------------------------------------------------------//







// DISPLAYING ALL PROJECTS (LIST) ----------------------------------------------------------------------------------------------------------------------------------- //


class ProjectList {
    templateElement: HTMLTemplateElement  // the <template> tag we are reaching out to... ( <template/> used to hold client-side content that you don't want to be rendered when a page loads)
    hostElement: HTMLDivElement // the final output will eventually be rendered in the <div id="app"></div> tag
    element: HTMLElement // !! a HTMLSectionElement type is not a thing, so we use HTMLElment instead. BUT THIS IS REACHING OUT SPECFICALLY TO A <section></section> tag
    assignedProjects: Project[]

    constructor(private type: 'active' | 'finished') {  // need to pass in which List you want rendered (either active projects or finished projects). This is used to determine the CSS of the list output
        this.templateElement = document.getElementById('project-list')! as HTMLTemplateElement // gives access to the <template id='project-list'></template> tag (must typecast to HTMLTemplateElement so TS knows your grabbing such an element. Otherwise TS just knows its a regular HTML element which might not have the properties its looking for)
        this.hostElement = document.getElementById('app')! as HTMLDivElement  // the element where we want the content to be eventually rendered in the HTML
        this.assignedProjects = []


        const importedNode = document.importNode(this.templateElement.content, true) // !!! this is the imported HTML content of the templateElement (all the content rendered inside of <template></template> tag (including the tag itself) )
        this.element = importedNode.firstElementChild as HTMLElement  // this targets the firstElement of the <template></template> tag... which is the <section></section> tag
        this.element.id = `${this.type}-projects`  // apply the CSS depending on which type the list is


        // hook up the listener so when a project gets created we can render the projects with renderProjects() method
        projectState.addListener((projects: Project[]) => {

            // only want to render projects that are relevant to this instance (if creating instance with 'active', only want to show active projects, else, only want to show 'finished' projects)
            const filteredProjects = projects.filter((project) => {
                if (this.type === 'active') {
                    return project.status === ProjectStatus.Active  // if active list, only show active projects
                } else {
                    return project.status === ProjectStatus.Finished  // if finished list, only show finished projects
                }
            })

            this.assignedProjects = filteredProjects // This listener is a function that takes an array of projects as its parameter and updates the this.assignedProjects property of the ProjectList instance with this array.
            this.renderProjects()
        })

        this.attach() // attaches our created element <section>[...]</section> into the dom
        this.renderContent()  // insert our content into the DOM once the <section></section> has been attached
    }

    // once the listener gets invoked, we reach out to the list we want it to be rendered, then we create a list item for the project and display it in our list
    private renderProjects() {
        const listEl = document.getElementById(`${this.type}-projects-list`)! as HTMLUListElement
        listEl.innerHTML = '' // when we get a new project to render, first clear all projects, then build up the list again with all projects (avoids duplicating projects)
        for(const projectItem of this.assignedProjects) {
            const listItem = document.createElement("li")
            listItem.textContent = projectItem.title
            listEl.appendChild(listItem)
        }
    }

    private renderContent() {
        const listId = `${this.type}-projects-list`
        this.element.querySelector('ul')!.id = listId  // grabs the <ul></ul> tag in the <section></section> element and gives it an id so we can target it
        this.element.querySelector('h2')!.textContent = this.type.toUpperCase() + ' PROJECTS'   // grabs the <h2></h2> tag in the <section></section> element and injects content into the tag
    }

    private attach() {
        this.hostElement.insertAdjacentElement('beforeend', this.element);  // !!!!!! INSERT THE <section></section> THAT INCLUDES OUR PROJECT LIST INTO THE <div id="app"></div> SO WE CAN DISPLAY IT !!!!!! //
    }

    // private addProject() {

    // }
}




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
    hostElement: HTMLDivElement // output will eventually be rendered in the <div id="app"></div> tag
    element: HTMLFormElement // this is the <form></form> rendered in the <template></template>
    titleInputElement: HTMLInputElement                                                             // input tag on line 16 in index HTML
    descriptionInputElement: HTMLInputElement                                                       // textarea tag on line 20 in index HTML
    peopleInputElement: HTMLInputElement                                                            // input tag on line 24 in index HTML

    constructor() {
        this.templateElement = document.getElementById('project-input')! as HTMLTemplateElement // gives access to the <template id='project-input'></template> tag (must typecast to HTMLTemplateElement so TS knows your grabbing such an element. Otherwise TS just knows its a regular HTML element which might not have the properties its looking for)
        this.hostElement = document.getElementById('app')! as HTMLDivElement  // the <div id="app"></div> where we want the content to be eventually rendered in the HTML

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

            // !!! manage the newly created project in state !!!
            projectState.addProject(title, desc, people)

            this.clearInputs() // clear form on a successful submission
        }

    }

    private configure() { // attach's an addEventListener to the <form></form> so we can submit
        this.element.addEventListener('submit', this.submitHandler)  // when the form is submitted, execute the logic inside submitHandler() method  !!! (if you dont want to create an @AutoBind decorator... you could simply just use the bind method and bind 'this' context when entering the submitHandler like this -----> this.submitHandler.bind(this) ) !!!
    }

    private attach() {
        this.hostElement.insertAdjacentElement('afterbegin', this.element);  // !!!!!! INSERT THE FORM INTO THE <div id="app"></div> INTO THE HTML SO WE CAN DISPLAY IT !!!!!! //
    }
}



//  ----------------------------------------------------------------------------------------------------------------------- //


// INITIALIZING THE APP

// creating an instance of this class will generate you the form for creating a new project
const projectInputForm = new ProjectInput()

// generating these instances will create two empty project lists (one for active projects, and one for finished projects)
const activeProjectList = new ProjectList('active')
const finishedProjectList = new ProjectList('finished')
