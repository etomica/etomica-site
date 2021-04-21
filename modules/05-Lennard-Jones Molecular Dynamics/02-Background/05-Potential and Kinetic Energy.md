

The total energy of a molecular system is a sum of kinetic and potential energies *E* = *K* + *U*. The kinetic energy *K* is the familiar quantity from mechanics, and is given in terms of the molecular masses and velocities.



$$
K = \textstyle \sum_j \frac{1}{2} m_jv_j^2
$$



where the sum over *j* indicates a sum over all atoms, each having mass $m_j$ and velocity $v_j$.     

The potential energy *U* arises from the interactions of the atoms with each other, and has its basis in the quantum mechanical treatment of the interactions among the charges on the electrons and protons in the system. The relatively simple models used in molecular simulation aim to quantify this complex interaction using simple analytic forms.  The Lennard-Jones model is the one used here.

In an adiabatic simulation of a rigid system, in which the system has no thermal contact with a reservoir and no work is performed, the total energy *E*, volume *V* and number of molecules *N* are fixed and unchanging. The set of configurations sampled by a system in such a situation is called the *microcanonical*, or *NVE* ensemble.  Although the total energy is fixed in the *NVE* ensemble, its kinetic and potential contributions can fluctuate, in analogy to the way a mass trades potential for kinetic energy as it falls to the ground under gravity.  In the *NVE* ensemble the temperature *T* is not fixed, but too fluctuates.  The instantaneous temperature can be defined in several ways.  The most common is through the equipartition theorem, which states



$$
\frac{K}{N} = \frac{d}{2}kT
$$



where *k* is Boltzmann's constant and *d* is the dimension of the system (usually *d* = 3 but sometimes we work with 2- and even 1-dimensional systems; this module defaults to the 2-D case).

Often it is more convenient to work with systems in equilibrium with a thermal reservoir at some fixed temperature.  In such systems the energy *E* is no longer a fixed quantity, but is fluctuating.  The configurations sampled by this system form the *canonical*, or *NVT* ensemble.  This module accomplishes this through use of an Andersen thermostat.  The velocity of one atom (selected at random) is randomized periodically, taking the new velocity from the Maxwell-Boltzmann distribution for the desired temperature.