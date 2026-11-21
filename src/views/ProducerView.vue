<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { RouterLink } from 'vue-router'
import Passport from '@/components/Passport.vue'
import Qr from '@/components/Qr.vue'
import { SAMPLE, encodeBatch, validateBatch, type Batch, type Errors } from '@/lib/batch'

const f = reactive<Batch>({ ...SAMPLE, code: '', producer: '', grove: '', variety: '', millName: '', harvestDate: '', pressDate: '', analysisDate: '', bottlingDate: '', harvestKg: NaN, pressTemp: NaN, acidity: NaN, peroxides: NaN, bottles: NaN, pressTime: '' })
const errors = ref<Errors>({})
const made = ref<Batch | null>(null)
const link = computed(() => (made.value ? `${location.origin}${import.meta.env.BASE_URL}#/p/${encodeBatch(made.value)}` : ''))
const sample = (): void => {
  Object.assign(f, SAMPLE)
  errors.value = {}
}
const num = (e: Event, k: 'harvestKg' | 'pressTemp' | 'acidity' | 'peroxides' | 'bottles'): void => {
  const v = (e.target as HTMLInputElement).value.replace(',', '.')
  f[k] = v.trim() === '' ? NaN : Number(v)
}
const submit = (): void => {
  const b: Batch = { ...f, code: f.code.trim().toUpperCase() }
  errors.value = validateBatch(b)
  made.value = Object.keys(errors.value).length ? null : b
}
const copied = ref(false)
const copy = async (): Promise<void> => {
  try {
    await navigator.clipboard.writeText(link.value)
    copied.value = true
    setTimeout(() => (copied.value = false), 1500)
  } catch { /* the link stays selectable */ }
}
const shown = (n: number): string | number => (Number.isNaN(n) ? '' : n)
const fields = [
  ['code', 'Κωδικός παρτίδας', 'KP-2611-A'], ['producer', 'Παραγωγός', ''], ['grove', 'Ελαιώνας', ''], ['variety', 'Ποικιλία', ''], ['millName', 'Ελαιοτριβείο', ''],
] as const
</script>

<template>
  <main class="wrap sect">
    <h2>Για τον παραγωγό: <em>ένας κωδικός ανά παρτίδα.</em></h2>
    <p class="sub">Δοκιμαστική φόρμα: τα στοιχεία είναι φανταστικά και μένουν στον browser σας.</p>
    <form class="form" novalidate @submit.prevent="submit">
      <div class="grid">
        <div v-for="x in fields" :key="x[0]" class="fld"><label :for="`f-${x[0]}`">{{ x[1] }}</label><input :id="`f-${x[0]}`" v-model="f[x[0]]" :placeholder="x[2]" autocomplete="off" :aria-invalid="!!errors[x[0]]" /><p v-if="errors[x[0]]" class="err">{{ errors[x[0]] }}</p></div>
        <div class="fld"><label for="f-hd">Ημερομηνία συγκομιδής</label><input id="f-hd" v-model="f.harvestDate" type="date" :aria-invalid="!!errors.harvestDate" /><p v-if="errors.harvestDate" class="err">{{ errors.harvestDate }}</p></div>
        <div class="fld"><label for="f-kg">Κιλά ελιές</label><input id="f-kg" :value="shown(f.harvestKg)" inputmode="numeric" :aria-invalid="!!errors.harvestKg" @input="num($event, 'harvestKg')" /><p v-if="errors.harvestKg" class="err">{{ errors.harvestKg }}</p></div>
        <div class="fld"><label for="f-pd">Ημερομηνία πίεσης</label><input id="f-pd" v-model="f.pressDate" type="date" :aria-invalid="!!errors.pressDate" /><p v-if="errors.pressDate" class="err">{{ errors.pressDate }}</p></div>
        <div class="fld"><label for="f-pt">Ώρα πίεσης</label><input id="f-pt" v-model="f.pressTime" type="time" :aria-invalid="!!errors.pressTime" /><p v-if="errors.pressTime" class="err">{{ errors.pressTime }}</p></div>
        <div class="fld"><label for="f-tmp">Μέγιστη θερμοκρασία (°C)</label><input id="f-tmp" :value="shown(f.pressTemp)" inputmode="decimal" :aria-invalid="!!errors.pressTemp" @input="num($event, 'pressTemp')" /><p v-if="errors.pressTemp" class="err">{{ errors.pressTemp }}</p></div>
        <div class="fld"><label for="f-ad">Ημερομηνία ανάλυσης</label><input id="f-ad" v-model="f.analysisDate" type="date" :aria-invalid="!!errors.analysisDate" /><p v-if="errors.analysisDate" class="err">{{ errors.analysisDate }}</p></div>
        <div class="fld"><label for="f-ac">Οξύτητα (%)</label><input id="f-ac" :value="shown(f.acidity)" inputmode="decimal" :aria-invalid="!!errors.acidity" @input="num($event, 'acidity')" /><p v-if="errors.acidity" class="err">{{ errors.acidity }}</p></div>
        <div class="fld"><label for="f-pe">Υπεροξείδια</label><input id="f-pe" :value="shown(f.peroxides)" inputmode="decimal" :aria-invalid="!!errors.peroxides" @input="num($event, 'peroxides')" /><p v-if="errors.peroxides" class="err">{{ errors.peroxides }}</p></div>
        <div class="fld"><label for="f-bd">Ημερομηνία εμφιάλωσης</label><input id="f-bd" v-model="f.bottlingDate" type="date" :aria-invalid="!!errors.bottlingDate" /><p v-if="errors.bottlingDate" class="err">{{ errors.bottlingDate }}</p></div>
        <div class="fld"><label for="f-bt">Φιάλες</label><input id="f-bt" :value="shown(f.bottles)" inputmode="numeric" :aria-invalid="!!errors.bottles" @input="num($event, 'bottles')" /><p v-if="errors.bottles" class="err">{{ errors.bottles }}</p></div>
        <div class="fld"><label for="f-ml">Μέγεθος φιάλης</label><select id="f-ml" v-model.number="f.bottleMl" :aria-invalid="!!errors.bottleMl"><option v-for="m in [250, 500, 750, 1000, 3000, 5000]" :key="m" :value="m">{{ m }} ml</option></select></div>
      </div>
      <div class="acts"><button type="submit" class="btn">Δημιουργία QR ετικέτας</button><button type="button" class="btn ghost" @click="sample">Συμπλήρωση με δείγμα</button></div>
      <p v-if="Object.keys(errors).length" class="err" role="alert">Διορθώστε τα πεδία που σημειώνονται.</p>
    </form>

    <section v-if="made" class="made" aria-live="polite">
      <div class="qrcol"><Qr :text="link" label="QR κωδικός της παρτίδας" /></div>
      <div>
        <h3>Η ετικέτα είναι έτοιμη</h3>
        <p class="sub">Εκτυπώστε το QR στην ετικέτα. Όποιος το σκανάρει θα δει τη διαδρομή της παρτίδας {{ made.code }}.</p>
        <p class="link"><code>{{ link }}</code></p>
        <div class="acts"><button type="button" class="btn ghost" @click="copy">{{ copied ? 'Αντιγράφηκε' : 'Αντιγραφή συνδέσμου' }}</button><RouterLink :to="`/p/${link.split('#/p/')[1]}`" class="btn ghost">Άνοιγμα σελίδας παρτίδας</RouterLink></div>
        <p class="note">Αν αλλάξετε κάποιο στοιχείο, φτιάξτε νέο QR. Στην πραγματική υπηρεσία η παρτίδα θα ήταν αποθηκευμένη και θα ενημερωνόταν χωρίς νέο QR.</p>
      </div>
    </section>
    <section v-if="made" class="sect preview"><h3>Έτσι θα το δει ο πελάτης</h3><Passport :batch="made" /></section>
  </main>
</template>
