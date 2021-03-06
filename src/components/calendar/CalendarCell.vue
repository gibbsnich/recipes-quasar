<template>
    <div class="acol">
        <h6 :class="['col-title', {'is-in-past': isInPastOrNextMonth }, {'is-today': isToday}]">
            {{ new Intl.DateTimeFormat('de-DE', {weekday: 'short', day: 'numeric', month: 'numeric'}).format(this.date) }}
        </h6>
        <span :class="['event-banner', 'mittag', {unknown: !this.middayEvent.extendedProps.recipeId}]" @click="this.middayClicked($event)">
            &nbsp;<span v-if="this.middayEvent.isInAutoList"><font-awesome-icon icon="check-square" />&nbsp;</span>{{ this.middayEvent.title }}
        </span>
        <span :class="['event-banner', 'abend', {unknown: !this.eveningEvent.extendedProps.recipeId}]" @click="this.eveningClicked($event)">
            &nbsp;<span v-if="this.eveningEvent.isInAutoList"><font-awesome-icon icon="check-square" />&nbsp;</span>{{ this.eveningEvent.title }}
        </span>
        <span :class="['event-banner', 'zusatz', {unknown: this.additionalEvent.extendedProps.ingredients.length === 0}]" @click="this.additionalClicked($event)">
            &nbsp;<span v-if="this.additionalEvent.isInAutoList"><font-awesome-icon icon="check-square" />&nbsp;</span>Zusatz
        </span>
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
                        title: time === 12 ? 'Mittags' : 'Abends',
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
                        title: time === 12 ? 'Mittags' : 'Abends',
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
        blink(event, fn) {
            event.target.classList.add('blink');
            setTimeout(() => { 
                event.target.classList.remove('blink');
                fn();
            }, 50);
        },
        middayClicked(event) {
            this.blink(event, () => this.$emit('clickedMidday', this.middayEvent));
        },
        eveningClicked(event) {
            this.blink(event, () => this.$emit('clickedEvening', this.eveningEvent));
        },
        additionalClicked(event) {
            this.blink(event, () => this.$emit('clickedAdditional', this.date));
        },
    },
});
</script>

<style scoped>
    .acol {
        width: 14.3%;
        display: flex;
        flex-direction: column;
        flex-grow: 1;
        overflow-x: hidden;
        padding-bottom: .5rem;
        user-select: none;
    }
    .event-banner {
       cursor: pointer;
       white-space: nowrap;
       font-size: .8rem;
    }
    h6.col-title {
        color: #333;
        overflow: hidden;
        white-space: nowrap;
        font-size: .8rem;
        padding-left: .5rem;
    }
    @media(max-width: 575px) {
        h6.col-title {
            font-size: .6rem;
            padding-left: 0;
        }   
    }
    h6.is-in-past {
        color: #999;
    }
    h6.is-today {
        color: #a60000b8;
        font-weight: bold;
    }
    .mittag.unknown {
        background-color: #0080FF30;
    }
    .mittag {
        background-color: #0080FF7c;
    }
    .abend.unknown {
        background-color: #FF800030;
    }
    .abend {
         background-color:#FF80007c;
    }
    .zusatz.unknown {
        background-color: #8bc34a30;
    }
    .zusatz {
        background-color: #8bc34a7c;
    }
    .blink {
        background-color: #888!important;
    }
</style>