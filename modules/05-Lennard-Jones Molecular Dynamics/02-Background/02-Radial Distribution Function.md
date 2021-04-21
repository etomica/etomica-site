

&quot;Molecular structure&quot; refers to the patterns and correlations that molecules exhibit in their placement in space. Some materials, such as water, have a complex structure that arises from strong interactions (such as hydrogen bonds) that cause molecules to orient and arrange themselves around each other in specific ways. Structure is important because it has a direct effect on the behavior of the bulk material. Well known anomalies in the behavior of water---the fact that it expands when cooled below 4 degrees C, for example---can be understood by examination of the molecular structure of the fluid phase near the freezing temperature.  Modelers trying to develop tools that are effective at predicting bulk-phase material properties often examine the ability of their models to capture the structural features at the molecular level.  If they succeed at describing this more fundamental behavior, it is much more likely that their models will be able to describe a wide variety of bulk-phase behaviors over a broad range of conditions.

Of course, molecules are in constant motion, rotating and moving about in erratic ways, so the notion of structure has meaning only in an average sense. There are many possible ways to quantify this average structure.  The *radial distribution function* (or *rdf*) is one such way, and is one of the most important.   The *rdf* addresses the question, &quot;given that I have one atom at some position, how many atoms can I expect to find at a distance *r* away from it?&quot;---more precisely, we ask for the number of atoms at a distance between *r *to *r* + *dr*.  The idea is demonstrated in this figure.



![](<./LJ Rdf shell t.GIF>)



The darkened atom at the center is the reference atom, and the circles around it represent the other atoms. A ring centered on the reference is drawn with radius *r* and thickness *dr*, and in this example three other atoms are positioned within this ring and highlighted.  

The *rdf* is important for three reasons


* for pairwise additive potentials, knowledge of the *rdf* is sufficient information to calculate thermodynamic properties, particularly the energy and pressure.
* there are very well developed integral-equation theories that permit estimation of the *rdf *for a given molecular model^M
* the *rdf* can be measured experimentally, using neutron-scattering techniques.

If the atoms are uncorrelated (*i.e.*, the fluid is unstructured), then the expected number of atoms at *r* is simply the average number of molecules per unit volume, times the volume of the shell of radius *r* and thickness *dr*.  For a system in a 3-dimensional space



$$
N_{ideal}(r) = \frac{N}{V}V_{shell}(r)
$$



where $\rho$ is the number density.  Clearly, the number of atoms expected at a distance *r* will increase without bound as *r* increases.  To quantify correlations in a structured fluid it makes sense to normalize the observed number of atoms at *r *by the number that would be observed if the atoms are uncorrelated.  This ratio is the radial distribution function, and it is commonly referred to as *g*(*r*).

The *rdf* can have a very complex form if it is applied to the atoms on a molecular system.  To understand these more complicated cases it is necessary first to be able to interpret *g*(*r*) for simple fluids, such as the monatomic Lennard-Jones model.  This module permits *g*(*r*) to be calculated and observed for Lennard-Jones systems over a range of temperature and density.