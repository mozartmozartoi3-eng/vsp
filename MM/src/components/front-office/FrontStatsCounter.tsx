import React, { useEffect, useState, useRef } from 'react';
import {
  Car,
  Users,
  Award,
  Warehouse,
  ShieldCheck,
  Building2,
  Wrench,
  Truck,
  CheckCircle2
} from 'lucide-react';

interface CounterItemProps {
  icon: React.ReactNode;
  target: number;
  prefix?: string;
  suffix?: string;
  label: string;
  description: string;
  colorClass: string;
  bgClass: string;
  startAnimation: boolean;
}

const AnimatedCounterItem: React.FC<CounterItemProps> = ({
  icon,
  target,
  prefix = '',
  suffix = '',
  label,
  description,
  colorClass,
  bgClass,
  startAnimation,
}) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!startAnimation) return;

    let startTimestamp: number | null = null;
    let animationFrameId: number;
    const duration = 2000; // 2 seconds natural smooth curve

    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      // Ease-out cubic curve: fast start, soft deceleration
      const easeOut = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(easeOut * target));

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(step);
      } else {
        setCount(target);
      }
    };

    animationFrameId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(animationFrameId);
  }, [target, startAnimation]);

  const formattedNumber = count.toLocaleString('fr-FR');

  return (
    <div className="flex flex-col items-center sm:items-start text-center sm:text-left p-5 rounded-2xl bg-slate-50 border border-slate-100 hover:border-blue-200 transition-all shadow-xs">
      <div className={`w-12 h-12 rounded-xl ${bgClass} ${colorClass} flex items-center justify-center mb-3 shadow-xs`}>
        {icon}
      </div>
      <div className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight tabular-nums">
        {prefix}{formattedNumber}{suffix}
      </div>
      <div className="text-xs sm:text-sm font-semibold text-slate-800 mt-1">
        {label}
      </div>
      <p className="text-xs text-slate-500 mt-1 leading-relaxed">
        {description}
      </p>
    </div>
  );
};

export const FrontStatsCounter: React.FC = () => {
  const [hasStarted, setHasStarted] = useState(false);
  const sectionRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setHasStarted(true);
        }
      },
      { threshold: 0.15 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <section ref={sectionRef} className="bg-white border-b border-gray-200 py-16 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-16">
        {/* BLOCK 1: Pourquoi nous faire confiance ? */}
        <div>
          <div className="text-center max-w-2xl mx-auto mb-10">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold mb-3">
              <ShieldCheck className="w-4 h-4 text-blue-600" />
              <span>Garanties et sécurité</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Pourquoi nous faire confiance ?
            </h2>
            <p className="text-slate-600 text-xs sm:text-sm mt-2">
              Un vrai garage avec pignon sur rue, des véhicules scrupuleusement révisés et un accompagnement complet.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Pillar 1: Concessionnaire physique */}
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100 hover:border-blue-200 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center mb-3">
                <Building2 className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">
                Garage physique à Aix-les-Bains
              </h3>
              <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                Situé au 11 Avenue du Grand Port (à côté de La Poste). Vous pouvez venir visiter notre parc, essayer nos modèles et échanger avec notre équipe.
              </p>
            </div>

            {/* Pillar 2: Révision 100 points */}
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100 hover:border-blue-200 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-3">
                <Wrench className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">
                Contrôle strict en 100 points
              </h3>
              <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                Moteur, variateur, courroie, freinage et batterie : chaque voiturette est révisée en atelier. Vidange intégrale et filtres neufs avant chaque livraison.
              </p>
            </div>

            {/* Pillar 3: Garantie 6 à 12 mois */}
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100 hover:border-blue-200 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center mb-3">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">
                Garantie mécanique incluse
              </h3>
              <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                Chaque modèle bénéficie d'une garantie contractuelle pièces et main-d'œuvre avec assistance pour rouler en toute sérénité.
              </p>
            </div>

            {/* Pillar 4: Carte grise et livraison */}
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100 hover:border-blue-200 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center mb-3">
                <Truck className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">
                Carte grise et livraison à domicile
              </h3>
              <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                Habilité par le Ministère de l'Intérieur (SIV), nous nous chargeons de l'immatriculation. Livraison sécurisée par camion plateau partout en France.
              </p>
            </div>
          </div>
        </div>

        {/* BLOCK 2: Nos chiffres (Compteur animé par ordre croissant) */}
        <div className="pt-8 border-t border-gray-100">
          <div className="text-center max-w-2xl mx-auto mb-8">
            <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              Nos chiffres
            </h3>
            <p className="text-slate-600 text-xs sm:text-sm mt-1">
              Des repères concrets qui illustrent la fiabilité et le savoir-faire de notre concession à Aix-les-Bains.
            </p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {/* 1: Ventes de véhicules */}
            <AnimatedCounterItem
              icon={<Car className="w-6 h-6" />}
              target={1000}
              prefix="+"
              label="Ventes de véhicules"
              description="Modèles sans permis neufs et occasions révisées remis à nos clients."
              colorClass="text-blue-600"
              bgClass="bg-blue-50"
              startAnimation={hasStarted}
            />

            {/* 2: Clients satisfaits */}
            <AnimatedCounterItem
              icon={<Users className="w-6 h-6" />}
              target={800}
              prefix="+"
              label="Clients satisfaits"
              description="Avis vérifiés en Savoie, Haute-Savoie, Isère et toute la France."
              colorClass="text-emerald-600"
              bgClass="bg-emerald-50"
              startAnimation={hasStarted}
            />

            {/* 3: Années d'expérience */}
            <AnimatedCounterItem
              icon={<Award className="w-6 h-6" />}
              target={10}
              prefix="+"
              suffix=" ans"
              label="Années d'expérience"
              description="Expertise mécanique et conseil spécialisé en voitures sans permis."
              colorClass="text-amber-600"
              bgClass="bg-amber-50"
              startAnimation={hasStarted}
            />

            {/* 4: + de 1 000 véhicules en stock */}
            <AnimatedCounterItem
              icon={<Warehouse className="w-6 h-6" />}
              target={1000}
              prefix="+"
              label="Véhicules en stock"
              description="Disponibilité immédiate de modèles révisés prêts pour la livraison."
              colorClass="text-purple-600"
              bgClass="bg-purple-50"
              startAnimation={hasStarted}
            />
          </div>
        </div>
      </div>
    </section>
  );
};
