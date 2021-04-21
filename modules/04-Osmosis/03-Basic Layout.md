

= Version I (Lennard-Jones Mixture) =

![](<./Clip image002.jpg>)

##System Key

**White Molecules**:  Membrane Molecules tethered to their equilibrium site with a spherical harmonic potential (spring constant K – see later)

**Blue Molecules**:   Solvent Molecules

**Red Molecules**: Solute Molecules.

##Variable Manipulation

**State Tab**: Allows temperature to be fixed. Simulation can then be run either with energy fixed, or temperature fixed.

**Membrane Tab:** Allows Lennard-Jones parameters (e and s), the spring constant for the membrane, the molecular weight of the atoms constituting the membrane and the thickness of the membrane (no of atomic layers) to be fixed.

**Configuration Tab:**  Allows solution density (left of the left membrane, and right of the right membrane), solvent density (between the two membranes) and solute mole fraction in solution to be fixed.

##Results

**Configuration Tab:**  The default display – shows the position of the molecules and their time evolution.

**Energy Tab:** Shows Potential, Kinetic and Total Energy as a function of simulation time. For adiabatic simulation, total energy should stay constant. For isothermal simulations the kinetic energy stays constant. The potential energy represents the configuration energy in the system. In general if the initial configuration is not the most favorable for the state variables, the system will move in a direction to lower it.

**Profiles Tab:**  Shows density profiles of solute and solvent molecules. When the system has reached equilibrium these should be symmetric around the membrane, and also constant
within the usual fluctuations of small systems, away from the membrane. The peaks near the membranes are the adsorption peaks.

**Osmotic Pressure Tab:**  Shows osmotic pressure as a function of simulation time. It is measured by measuring the net force on the membranes and dividing by the surface area of the membranes.

**Metrics Tab:**  Shows simulation time, temperature, potential energy, and osmotic pressure as a function of simulation time.

**Flux Tab:**  Shows the time evolution of flux across the membrane. Once a system reaches equilibrium this should be zero.
 
=Version II (Brine Solution)=

![](<./Clip image001.jpg>)

##System Key

**Blue Molecules:**  Membrane Molecules tethered to their equilibrium site with a spherical harmonic potential (spring constant K – see later)

**Red/White Molecules:**   Solvent (Water) Molecules –Red oxygen atoms, and white hydrogen atoms

**Green:**  Cl- ions

**Blue:** Na+ ions
 
##Variable Manipulation
(Parts not present in Lennard-Jones module)

**Solute Button:** Allows charge in e units on the solute molecules to be adjusted (note that the number of positive and negative ions is equal, so the charge of both ions will change)

**Membrane:**  In addition to the membrane thickness, the number of membrane molecules(width) can also be changed.