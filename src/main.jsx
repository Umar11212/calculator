import React from "react";
import { createRoot } from "react-dom/client";
import "./style.css";

const controls = [
  {
    key: "sheetPrice",
    label: "Цена листа металла",
    suffix: "сом",
    min: 0,
    max: 3000,
    step: 10,
  },
  {
    key: "itemsPerSheet",
    label: "Количество изделий с одного листа",
    suffix: "шт",
    min: 0,
    max: 30,
    step: 1,
  },
  {
    key: "masterPay",
    label: "Оплата мастеру за 1 шт",
    suffix: "сом",
    min: 0,
    max: 500,
    step: 5,
  },
  {
    key: "electricity",
    label: "Расходы на свет за 1 шт",
    suffix: "сом",
    min: 0,
    max: 200,
    step: 1,
  },
  {
    key: "smallExpenses",
    label: "Мелкие расходы на 1 шт",
    suffix: "сом",
    min: 0,
    max: 300,
    step: 5,
  },
  {
    key: "logistics",
    label: "Логистика / доставка на 1 шт",
    suffix: "сом",
    min: 0,
    max: 500,
    step: 5,
  },
  {
    key: "marginPercent",
    label: "Желаемая маржа / наценка",
    suffix: "%",
    min: 0,
    max: 100,
    step: 1,
  },
  {
    key: "taxPercent",
    label: "Процент НДС",
    suffix: "%",
    min: 0,
    max: 30,
    step: 1,
  },
];

const initialValues = {
  sheetPrice: 580,
  itemsPerSheet: 6,
  masterPay: 50,
  electricity: 15,
  smallExpenses: 20,
  logistics: 0,
  marginPercent: 20,
  taxPercent: 14,
};

const storageKey = "mangal-calculator-values";

const loadSavedValues = () => {
  try {
    const savedValues = localStorage.getItem(storageKey);
    return savedValues ? { ...initialValues, ...JSON.parse(savedValues) } : initialValues;
  } catch {
    return initialValues;
  }
};

const formatMoney = (value) =>
  new Intl.NumberFormat("ru-RU", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number.isFinite(value) ? value : 0);

function NumberControl({ config, value, onChange }) {
  const handleChange = (event) => {
    const nextValue = event.target.value === "" ? 0 : Number(event.target.value);
    onChange(config.key, Number.isFinite(nextValue) ? nextValue : 0);
  };

  return (
    <label className="group rounded-2xl border border-slate-800 bg-slate-950/70 p-4 shadow-lg shadow-black/20 transition hover:border-slate-700">
      <div className="mb-3 flex items-start justify-between gap-3">
        <span className="text-sm font-medium text-slate-300">{config.label}</span>
        <span className="rounded-full bg-slate-800 px-2.5 py-1 text-xs font-semibold text-slate-300">
          {config.suffix}
        </span>
      </div>

      <input
        type="number"
        min={config.min}
        max={config.max}
        step={config.step}
        value={value}
        onChange={handleChange}
        className="mb-4 w-full rounded-xl border border-slate-800 bg-slate-900 px-4 py-3 text-lg font-semibold text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-400 focus:ring-4 focus:ring-cyan-400/10"
      />

      <input
        type="range"
        min={config.min}
        max={config.max}
        step={config.step}
        value={Math.min(Math.max(value, config.min), config.max)}
        onChange={handleChange}
        className="h-2 w-full cursor-pointer accent-cyan-400"
      />
    </label>
  );
}

function ExpenseBar({ item, maxValue }) {
  const width = maxValue > 0 ? Math.max((item.value / maxValue) * 100, 3) : 0;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-3 text-sm">
        <div className="flex items-center gap-2">
          <span className={`h-3 w-3 rounded-full ${item.dotColor}`} />
          <span className="font-medium text-slate-200">{item.label}</span>
        </div>
        <span className="font-semibold text-white">{formatMoney(item.value)} сом</span>
      </div>

      <div className="h-4 overflow-hidden rounded-full bg-slate-800">
        <div
          className={`h-full rounded-full ${item.barColor} shadow-lg transition-all duration-500`}
          style={{ width: `${width}%` }}
        />
      </div>
    </div>
  );
}

function ResultRow({ label, value, tone = "text-white" }) {
  return (
    <div className="flex flex-col gap-1 rounded-2xl bg-slate-950/70 p-4 sm:flex-row sm:items-center sm:justify-between">
      <span className="text-sm font-medium text-slate-400">{label}</span>
      <span className={`text-xl font-bold ${tone}`}>{formatMoney(value)} сом</span>
    </div>
  );
}

function App() {
  const [values, setValues] = React.useState(loadSavedValues);

  React.useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(values));
  }, [values]);

  const calculations = React.useMemo(() => {
    const metalCost =
      values.itemsPerSheet > 0 ? values.sheetPrice / values.itemsPerSheet : 0;
    const productionCost =
      metalCost +
      values.masterPay +
      values.electricity +
      values.smallExpenses +
      values.logistics;
    const profit = productionCost * (values.marginPercent / 100);
    const priceWithoutVat = productionCost + profit;
    const vatAmount = priceWithoutVat * (values.taxPercent / 100);
    const salePrice = priceWithoutVat + vatAmount;

    return {
      metalCost,
      productionCost,
      profit,
      priceWithoutVat,
      vatAmount,
      salePrice,
    };
  }, [values]);

  const chartItems = [
    {
      label: "Металл",
      value: calculations.metalCost,
      dotColor: "bg-cyan-400",
      barColor: "bg-cyan-400",
    },
    {
      label: "Мастер",
      value: values.masterPay,
      dotColor: "bg-violet-400",
      barColor: "bg-violet-400",
    },
    {
      label: "Свет",
      value: values.electricity,
      dotColor: "bg-amber-400",
      barColor: "bg-amber-400",
    },
    {
      label: "Мелкие расходы",
      value: values.smallExpenses,
      dotColor: "bg-emerald-400",
      barColor: "bg-emerald-400",
    },
    {
      label: "Логистика",
      value: values.logistics,
      dotColor: "bg-orange-400",
      barColor: "bg-orange-400",
    },
    {
      label: "Прибыль завода",
      value: calculations.profit,
      dotColor: "bg-lime-400",
      barColor: "bg-lime-400",
    },
    {
      label: "НДС",
      value: calculations.vatAmount,
      dotColor: "bg-rose-400",
      barColor: "bg-rose-400",
    },
  ];

  const maxChartValue = Math.max(...chartItems.map((item) => item.value), 1);

  const updateValue = (key, nextValue) => {
    setValues((current) => ({
      ...current,
      [key]: Math.max(0, nextValue),
    }));
  };

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-6 text-slate-100 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-6xl flex-col gap-6">
        <section className="overflow-hidden rounded-2xl border border-cyan-400/20 bg-slate-900 p-6 shadow-2xl shadow-cyan-950/30 sm:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="mb-2 text-sm font-semibold uppercase tracking-[0.18em] text-cyan-300">
                Калькулятор мангала
              </p>
              <h1 className="text-2xl font-bold text-white sm:text-4xl">
                Рекомендуемая цена продажи
              </h1>
              <p className="mt-2 text-slate-400">
                Расчет на 1 штуку изделия с учетом прибыли и НДС
              </p>
            </div>

            <div className="rounded-2xl bg-cyan-400 px-6 py-5 text-slate-950 shadow-xl shadow-cyan-500/20 sm:min-w-80">
              <p className="text-sm font-bold uppercase tracking-wide text-slate-800">
                Конечная цена продажи (сом)
              </p>
              <div className="mt-1 text-4xl font-black sm:text-5xl">
                {formatMoney(calculations.salePrice)}
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5 shadow-2xl shadow-black/25 sm:p-6">
            <h2 className="text-xl font-bold text-white">Структура цены</h2>
            <p className="mt-1 text-sm text-slate-400">
              Производственные расходы, прибыль и НДС в сомах
            </p>

            <div className="mt-6 space-y-5">
              {chartItems.map((item) => (
                <ExpenseBar key={item.label} item={item} maxValue={maxChartValue} />
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5 shadow-2xl shadow-black/25 sm:p-6">
            <h2 className="text-xl font-bold text-white">Параметры расчета</h2>
            <p className="mt-1 text-sm text-slate-400">
              Измените значения, и цена пересчитается автоматически
            </p>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              {controls.map((control) => (
                <NumberControl
                  key={control.key}
                  config={control}
                  value={values[control.key]}
                  onChange={updateValue}
                />
              ))}
            </div>
          </div>
        </section>

        <section className="grid gap-4 rounded-2xl border border-slate-800 bg-slate-900 p-5 shadow-2xl shadow-black/25 sm:grid-cols-3 sm:p-6">
          <div className="rounded-2xl bg-slate-950/70 p-4">
            <p className="text-sm text-slate-400">Металл на 1 мангал</p>
            <p className="mt-2 text-2xl font-bold text-cyan-300">
              {formatMoney(calculations.metalCost)} сом
            </p>
          </div>
          <div className="rounded-2xl bg-slate-950/70 p-4">
            <p className="text-sm text-slate-400">Цена без НДС</p>
            <p className="mt-2 text-2xl font-bold text-white">
              {formatMoney(calculations.priceWithoutVat)} сом
            </p>
          </div>
          <div className="rounded-2xl bg-slate-950/70 p-4">
            <p className="text-sm text-slate-400">НДС {values.taxPercent}%</p>
            <p className="mt-2 text-2xl font-bold text-rose-300">
              {formatMoney(calculations.vatAmount)} сом
            </p>
          </div>
        </section>

        <section className="rounded-2xl border border-cyan-400/30 bg-slate-900 p-5 shadow-2xl shadow-cyan-950/30 sm:p-6">
          <div className="mb-5">
            <h2 className="text-2xl font-black text-white">Итоги</h2>
            <p className="mt-1 text-sm text-slate-400">
              Финальный расчет цены для продажи одного мангала
            </p>
          </div>

          <div className="grid gap-4 lg:grid-cols-3">
            <ResultRow
              label="Полная себестоимость изделия"
              value={calculations.productionCost}
              tone="text-cyan-300"
            />
            <ResultRow
              label="Заложенная прибыль завода"
              value={calculations.profit}
              tone="text-lime-300"
            />
            <ResultRow
              label="Сумма НДС к уплате"
              value={calculations.vatAmount}
              tone="text-rose-300"
            />
          </div>

          <div className="mt-5 rounded-2xl bg-cyan-400 p-5 text-slate-950 shadow-xl shadow-cyan-500/20">
            <p className="text-sm font-black uppercase tracking-wide text-slate-800">
              Рекомендуемая цена для продажи
            </p>
            <p className="mt-2 text-4xl font-black sm:text-6xl">
              {formatMoney(calculations.salePrice)} сом
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}

createRoot(document.getElementById("root")).render(<App />);

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/service-worker.js");
  });
}
