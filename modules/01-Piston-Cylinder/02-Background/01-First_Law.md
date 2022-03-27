# First Law

## Internal Energy

The first law of thermodynamics is an energy balance. It states that net sum of the energy transferred into or out of a system equals the change in its energy. This law is important to predicting the behavior of a complex system as it undergoes various changes, such as heating, expansion, boiling, and so on. This first law permits us to predict, for example, by how much the temperature and pressure will change as chemicals react, or as another example, how much power we can expect to get from a generator as it burns a fuel.

Mechanical systems, such as a pendulum or a mass on a spring, hold their energy in kinetic and potential forms. Kinetic energy is the energy of motion, while a familiar example of potential energy is that acquired by an object as it is raised to a higher level in a gravitational field. Systems described by thermodynamics can store energy in these ways also, but this aspect is not of particular interest in this context. Instead, thermodynamics focuses on how systems store energy in the motion and interaction of the molecules it comprises, i.e., in the molecules' kinetic and potential energies. At the macroscopic level, the molecular behaviors occur on a scale too small to be seen, so all this energy is lumped into a single term, called "internal energy". In molecular simulations, molecules can of course be seen, so the changes occurring as a system gains or loses internal energy are apparent in the changes in the motion of the molecules. It can be observed that the molecules move faster when the internal energy is increased. Molecules also may store potential energy as a consequence of their interactions with each other. Real molecules tend to want to stick together loosely, and some energy is required to separate them, just as mechanical systems require energy to be elevated in a gravitational field. The manner that these energy-storage methods enter into the energy balance is a concern of thermodynamics.

A thermodynamic system exchanges energy with its surroundings in the form of heat and/or work. The first law states that any energy lost or gained via these mechanisms adds to or diminishes the internal energy of the system. In thermodynamics, the internal energy is nothing more than a bookkeeping term in the energy balance. But in our simulations we have a window on the microscopic world, and we can see how the internal-energy changes manifest themselves in the molecular behaviors.

In this simulation module, we consider our system to be all the molecules contained within the piston-cylinder apparatus. The piston-cylinder apparatus itself forms the surroundings, and it may store energy in any of three ways. First, the piston can move with some velocity, and thus it may acquire kinetic energy. Second, the piston has a pressure acting on it, which may be viewed as the effect of a weight applied atop it, and as it moves up and down the potential energy of the mass increases and decreases. Third, the cylinder can act as a heat reservoir, and thus can accept or release energy from/to the molecules in the form of heat, without itself being affected by the transfer. It is as if the cylinder were located within a large container of water that is fixed at some temperature.

## Work

Work occurs when a force acts to move an object across a distance. The relevant equation is

:$W = F \times \Delta x$

Work is performed on (or by) the piston-cylinder apparatus when the piston is moved against (or by) the force of the fluid of molecules inside the cylinder. The force is equal to the resisting pressure times the area of the piston

:$F = P \times A$

while the displacement can be given in terms of the volume change via the piston area

:$\Delta x = \frac{\Delta V}{A}$

Consequently, the work can be expressed in terms of the pressure and the volume change

:$W = P \times \Delta V$

All of these equations assume that the force (or pressure) does not change during the process. Otherwise, a differential form is appropriate.

## Heat

Energy can also be transferred into a system via molecular-level interactions with the surroundings. Molecules in the system bounce into the molecules of the container, and energy is transferred. Like the internal energy, these phenomena occur on a scale too small to be seen macroscopically, so in thermodynamics the sum of these myriad interactions are lumped together and called "heat." This is the only difference between heat and work: work is energy transferred through some macroscopic phenomenon, such as the motion of a piston; heat is energy transferred through microscopic processes.

In the piston-cylinder module, the details of heat transfer are not included in the molecular simulation. Instead the walls of the cylinder are described as smooth planar surfaces, with no atomic detail. The heat transfer process is modeled by changing the velocities of molecules at each step in the simulation. The velocities are chosen to be consistent with the selected wall temperature: if the temperature is high, the velocities will be large; if the temperature is low, the velocities will be small. Any change in the velocity of a molecule changes its kinetic energy, and is thus a form of microscopic energy transfer, i.e. heat. We have no meter in place to quantify directly this heat transfer process. Instead, the amount of heat transferred must be deduced from measurements of work performed and change of temperature of the system, from which the change in internal energy can be inferred.