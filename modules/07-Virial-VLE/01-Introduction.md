---
slug: ./
---


The Virial-VLE module consists of two parts.



Part one, Virial, takes as input a set of values for the second virial coefficient for a non–ideal gas $B(T_i)$ at different temperatures $T_i$, measured or otherwise obtained elsewhere, as well as a set of intermolecular potential parameters (Lennard–Jones parameters and a quadrupole moment). Virial generates a function B(T) from theory which is plotted
together with the experimental data. The potential parameters can be adjusted interactively in a graphical
window in order to match the theoretical B(T) curve with the experimental data. The Virial module can
therefore be used to obtain a set of intermolecular potential parameters for subsequent molecular dynamics
or Monte Carlo simulations of a nonideal system, with the potential parameters being chosen such that they
yield the correct B(T).

The second part of this module, VLE, provides an interactive simulation of the vapor–liquid equilibrium
(VLE) for a non–ideal vapor / liquid one–component system. The simulation window has several “tabs”
displaying various graphs and two simulation boxes. One box is for the vapor phase and one for the
liquid phase. The temperature as well as parameters for the intermolecular potential may be adjusted. In
this simulation, the intermolecular potential is a Lennard–Jones (LJ) potential augmented with quadrupole
electrostatic terms which may be obtained indirectly from virial coefficients by applying the Virial module
(vide supra), or from other sources. As the simulation proceeds, the number of particles in the two phases
changes. Dynamic plots are available showing the number of atoms in the liquid and vapor phase, the
corresponding densities, and in a combined plot the pressure in the liquid and in the vapor phase. Numerical
values are also provided in a table besides the various visualizations, along with the running averages and
the statistical errors. This allows to easily monitor the convergence of the simulation.

The combination of the two modules is intended to provide a theoretical and computing / visualization
framework to link two experiments that are commonly performed in the undergraduate physical chemistry
laboratory: the measurement of virial coefficients and the measurement of the VLE. This computational
experiment demonstrates that nonideal behavior has its origin in the atomistic structure of matter, via the
properties of the intermolecular potential energy surface (PES). For instance, non–ideal behavior may arise
due to attractive forces between the molecules.
The VLE itself underlies many industrial separation processes and is therefore of immense practical
importance. At the same time it is the archetype of a thermodynamic phase transition. The simulation combines concepts
about molecular structure and intermolecular interactions and relates it to the behavior of systems as
encountered in the laboratory.
This module is applicable to thermodynamics and statistical mechanics courses at both the undergraduate
and graduate levels.
