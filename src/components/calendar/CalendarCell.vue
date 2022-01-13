<template>
    <div class="acol">
        <h6 :class="[{'is-in-past': isInPastOrNextMonth }, {'is-today': isToday}]">
            {{ new Intl.DateTimeFormat('de-DE', {weekday: 'short'}).format(this.date) }}
            {{ this.date.getDate() }}.{{ this.date.getMonth()+1 }}.
        </h6>
        <span :class="['event-banner', 'mittag', {unknown: !this.middayEvent.extendedProps.recipeId}]" @click="this.$emit('clickedMidday', this.middayEvent)">&nbsp;Mittags</span>
        <span :class="['event-banner', 'abend', {unknown: !this.eveningEvent.extendedProps.recipeId}]" @click="this.$emit('clickedEvening', this.eveningEvent)">&nbsp;Abends</span>
        <span :class="['event-banner', 'zusatz', {unknown: this.additionalEvent.extendedProps.ingredients.length === 0}]" @click="this.$emit('clickedAdditional', this.date)">&nbsp;Zusatz</span>
    </div>
</template>

<script>
import { defineComponent, reactive } from 'vue';
import { dateToString } from '../../util/date.js';

export default defineComponent({
    name: 'CalendarCell',
    emits: ['clickedMidday', 'clickedEvening', 'clickedAdditional'],
    props: {
        date: Date,
        // middayEvent: Object,
        // eveningEvent: Object,
        // additionalEvent: Object,
    },
    data() {
        return {
            // middayEvent: null,
            // eveningEvent: null,
            // additionalEvent: null,
        }
    },
    beforeMount() {
        // const dateStr = dateToString(this.date);
        // this.middayEvent = this.$store.getters.getEventByStart(`${dateStr}T12:00`);
        // this.eveningEvent = this.$store.getters.getEventByStart(`${dateStr}T18:00`);
        // this.additionalEvent = this.$store.getters.getIngredientEventByStart(`${dateStr}T14:00`);
    },
    computed: {
        middayEvent: {
            get() {
                const dateStr = dateToString(this.date);
                const time = 12;
                const event = this.$store.getters.getEventByStart(`${dateStr}T${time}:00`);
                if (event) {
                    return event;
                } else {
                    const newEvent = reactive({
                        eventStart: `${dateStr}T${time}:00`,
                        start: this.date,
                        title: time === 12 ? 'Mittagessen' : 'Abendessen',
                        extendedProps: {recur: true, ingredients: []},
                    });
                    return newEvent;
                }
            },
        },
        eveningEvent: {
            get() {
                const dateStr = dateToString(this.date);
                const time = 18;
                const event = this.$store.getters.getEventByStart(`${dateStr}T${time}:00`);
                if (event) {
                    return event;
                } else {
                    const newEvent = reactive({
                        eventStart: `${dateStr}T${time}:00`,
                        start: this.date,
                        title: time === 12 ? 'Mittagessen' : 'Abendessen',
                        extendedProps: {recur: true, ingredients: []},
                    });
                    return newEvent;
                }
            },
        },
        additionalEvent: {
            get() {
                const dateStr = dateToString(this.date);
                const time = 14;
                const event = this.$store.getters.getEventByStart(`${dateStr}T${time}:00`);
                if (event) {
                    return event;
                } else {
                    const newEvent = reactive({
                        eventStart: `${dateStr}T${time}:00`,
                        start: this.date,
                        title: 'Zusatz',
                        extendedProps: {recur: true, ingredients: []},
                    });
                    return newEvent;
                }
            },
        },
        isInPastOrNextMonth: {
            get() {
                const myTime = this.date.getTime();
                const comp = new Date();
                comp.setHours(0);
                const compTime = comp.getTime();
                return myTime < compTime || this.date.getMonth() > comp.getMonth();
            },
        },
        isToday: {
            get() {
                const today = new Date();
                return this.date.getDate() === today.getDate() && this.date.getMonth() === today.getMonth() && this.date.getYear() === today.getYear();
            }
        },
    },
    methods: {
        // isInPast() {
        //     const myTime = this.date.getTime();
        //     const compTime = new Date().setHours(0).getTime();
        //     debugger;
        //     return myTime < compTime;
        // }
    }
});
</script>

<style scoped>
    .acol {
        width: 14.3%;
        display: flex;
        flex-direction: column;
        flex-grow: 1;
        overflow-x: hidden;
        padding-bottom: .3rem;
        user-select: none;
        margin-bottom: .2rem;
    }
    .event-banner {
       cursor: pointer;
    }
    h6 {
        color: #333;
        overflow: hidden;
        white-space: nowrap;
    }
    h6.is-in-past {
        color: #ccc;
    }
    h6.is-today {
        color: #ff0000c4;
        font-weight: bold;
    }
    .mittag.unknown {
        background-color: #0080FF30;
    }
    .mittag {
        background-color: #0080FF;
    }
    .abend.unknown {
        background-color: #FF800030;
    }
    .abend {
         background-color:#FF8000;
    }
    .zusatz.unknown {
        background-color: #8bc34a30;
    }
    .zusatz {
        background-color: #8bc34a;
    }
</style>