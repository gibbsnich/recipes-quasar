import { boot } from 'quasar/wrappers';

import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap';

import { library } from '@fortawesome/fontawesome-svg-core';
import { faSave, faPlusSquare, faMinusSquare, 
            faCaretSquareLeft, faCaretSquareRight, faCartPlus,
            faFile, faCalendar, faTrash, faFileImport, faMeteor } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';

export default boot(({ app }) => {
    library.add(faSave, faPlusSquare, faMinusSquare, 
        faCaretSquareLeft, faCaretSquareRight, faCartPlus,
        faFile, faCalendar, faTrash, faFileImport, faMeteor );
    app.component('font-awesome-icon', FontAwesomeIcon); 
});